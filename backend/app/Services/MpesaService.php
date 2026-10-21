<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Invoice;
use App\Models\PaymentReceipt;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class MpesaService
{
    /**
     * Format phone number to 2547XXXXXXXX
     */
    public static function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        } elseif (str_starts_with($phone, '7') || str_starts_with($phone, '1')) {
            $phone = '254' . $phone;
        } elseif (str_starts_with($phone, '+254')) {
            $phone = substr($phone, 1);
        }
        return $phone;
    }

    /**
     * Initiate Daraja STK Push prompt to customer phone
     */
    public function initiateStkPush(string $phoneNumber, float $amount, string $referenceNumber, string $description = 'Solar Purchase')
    {
        $formattedPhone = self::formatPhoneNumber($phoneNumber);
        $till = SystemSetting::get('mpesa_till', '543210');

        // Note: When live Daraja credentials (Consumer Key, Consumer Secret, Passkey) are added to .env,
        // this authenticates against Safaricom Sandbox/Production endpoint.
        $consumerKey = config('services.mpesa.consumer_key');
        $consumerSecret = config('services.mpesa.consumer_secret');
        $passkey = config('services.mpesa.passkey');
        $shortcode = config('services.mpesa.shortcode', $till);

        if (!$consumerKey || !$consumerSecret) {
            // Emulate STK push response when credentials are in mock/development mode
            return [
                'status' => 'initiated',
                'mode' => 'sandbox_simulation',
                'MerchantRequestID' => 'MRQ-' . uniqid(),
                'CheckoutRequestID' => 'ws_CO_' . date('YmdHis') . '_' . rand(1000, 9999),
                'ResponseCode' => '0',
                'ResponseDescription' => 'Success. Request accepted for processing',
                'CustomerMessage' => "Success. Prompt sent to phone {$formattedPhone}. Enter M-Pesa PIN to complete payment of KES " . number_format($amount, 2),
            ];
        }

        // Live Daraja API token fetch
        $authUrl = config('services.mpesa.env') === 'production'
            ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

        $authRes = Http::withBasicAuth($consumerKey, $consumerSecret)->get($authUrl);
        if (!$authRes->successful()) {
            throw new Exception("Daraja authentication failed: " . $authRes->body());
        }

        $accessToken = $authRes->json('access_token');
        $timestamp = date('YmdHis');
        $password = base64_encode($shortcode . $passkey . $timestamp);

        $stkUrl = config('services.mpesa.env') === 'production'
            ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

        $stkRes = Http::withToken($accessToken)->post($stkUrl, [
            'BusinessShortCode' => $shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerBuyGoodsOnline',
            'Amount' => round($amount),
            'PartyA' => $formattedPhone,
            'PartyB' => $shortcode,
            'PhoneNumber' => $formattedPhone,
            'CallBackURL' => url('/api/v1/payments/mpesa/callback'),
            'AccountReference' => substr($referenceNumber, 0, 12),
            'TransactionDesc' => substr($description, 0, 13),
        ]);

        return $stkRes->json();
    }

    /**
     * Process Safaricom Callback Webhook
     */
    public function handleCallback(array $payload)
    {
        Log::info('M-Pesa Callback Received:', $payload);

        $stkCallback = $payload['Body']['stkCallback'] ?? null;
        if (!$stkCallback) return;

        $resultCode = $stkCallback['ResultCode'] ?? -1;
        $checkoutRequestId = $stkCallback['CheckoutRequestID'] ?? null;

        if ($resultCode === 0) {
            // Payment Successful
            $meta = $stkCallback['CallbackMetadata']['Item'] ?? [];
            $amount = 0.0;
            $mpesaReceiptNumber = '';
            $phoneNumber = '';

            foreach ($meta as $item) {
                if ($item['Name'] === 'Amount') $amount = (float) $item['Value'];
                if ($item['Name'] === 'MpesaReceiptNumber') $mpesaReceiptNumber = (string) $item['Value'];
                if ($item['Name'] === 'PhoneNumber') $phoneNumber = (string) $item['Value'];
            }

            Log::info("Payment confirmed via Daraja: {$mpesaReceiptNumber} - Amount: {$amount} - Phone: {$phoneNumber}");
            return [
                'success' => true,
                'receipt' => $mpesaReceiptNumber,
                'amount' => $amount,
                'phone' => $phoneNumber,
            ];
        }

        return ['success' => false, 'reason' => $stkCallback['ResultDesc'] ?? 'Failed'];
    }
}
