<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\MpesaService;
use App\Models\Order;
use App\Models\Invoice;

class MpesaController extends Controller
{
    protected MpesaService $mpesaService;

    public function __construct(MpesaService $mpesaService)
    {
        $this->mpesaService = $mpesaService;
    }

    /**
     * Customer triggers STK push prompt from checkout
     */
    public function triggerStkPush(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $response = $this->mpesaService->initiateStkPush(
            $validated['phone'],
            $validated['amount'],
            $order->order_number,
            'Order Payment'
        );

        return response()->json([
            'message' => 'M-Pesa STK push prompt sent to your phone. Enter your PIN to complete payment.',
            'daraja_response' => $response,
        ]);
    }

    /**
     * Safaricom Webhook Callback
     */
    public function handleCallback(Request $request)
    {
        $result = $this->mpesaService->handleCallback($request->all());

        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Accepted',
        ]);
    }
}
