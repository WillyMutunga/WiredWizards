<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Quotation;
use App\Models\Invoice;
use App\Models\SystemSetting;

class WhatsAppService
{
    /**
     * Get the configured business WhatsApp telephone number
     */
    public static function getBusinessWhatsApp(): string
    {
        $raw = SystemSetting::get('contact_phone', '+254712345678');
        // Strip non-digits
        $cleaned = preg_replace('/[^0-9]/', '', $raw);
        if (str_starts_with($cleaned, '0')) {
            $cleaned = '254' . substr($cleaned, 1);
        }
        return $cleaned;
    }

    /**
     * Customer enquiry click for a specific product
     */
    public static function generateProductInquiryLink(Product $product): string
    {
        $phone = self::getBusinessWhatsApp();
        $message = "Hello Wired Wizards, I am inquiring about the *{$product->name}* (SKU: `{$product->sku}`). Price: KES " . number_format($product->discount_price ?? $product->selling_price, 2) . ". Is this currently available for delivery / store pickup?";

        return 'https://wa.me/' . $phone . '?text=' . urlencode($message);
    }

    /**
     * Sales agent sharing a Quotation to customer WhatsApp
     */
    public static function generateQuotationShareLink(Quotation $quote): string
    {
        $custPhone = preg_replace('/[^0-9]/', '', $quote->customer->phone ?? '');
        if (str_starts_with($custPhone, '0')) {
            $custPhone = '254' . substr($custPhone, 1);
        }

        $pdfUrl = url("/api/v1/quotations/{$quote->id}/pdf");
        $message = "Hello *{$quote->customer->name}*, here is your official solar quotation *#{$quote->quotation_number}* from Wired Wizards Engineering Ltd for *KES " . number_format($quote->grand_total, 2) . "*.\n\nDownload PDF: {$pdfUrl}\n\nValid until: " . $quote->valid_until->format('d M Y');

        return 'https://wa.me/' . $custPhone . '?text=' . urlencode($message);
    }

    /**
     * Sales agent sharing an Invoice to customer WhatsApp
     */
    public static function generateInvoiceShareLink(Invoice $invoice): string
    {
        $custPhone = preg_replace('/[^0-9]/', '', $invoice->customer->phone ?? '');
        if (str_starts_with($custPhone, '0')) {
            $custPhone = '254' . substr($custPhone, 1);
        }

        $till = SystemSetting::get('mpesa_till', '543210');
        $pdfUrl = url("/api/v1/invoices/{$invoice->id}/pdf");
        $message = "Hello *{$invoice->customer->name}*, please find your tax invoice *#{$invoice->invoice_number}* for *KES " . number_format($invoice->total_amount, 2) . "* (Balance due: KES " . number_format($invoice->balance_due, 2) . ").\n\nPay via M-Pesa Buy Goods Till: *{$till}*\nDownload Invoice PDF: {$pdfUrl}";

        return 'https://wa.me/' . $custPhone . '?text=' . urlencode($message);
    }
}
