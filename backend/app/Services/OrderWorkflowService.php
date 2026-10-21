<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\PaymentReceipt;
use App\Models\Product;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderWorkflowService
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Create customer online or staff order
     */
    public function createOrder(array $data, int $customerId, ?int $salesAgentId = null): Order
    {
        return DB::transaction(function () use ($data, $customerId, $salesAgentId) {
            $orderNumber = DocumentNumberService::generateOrderNumber();
            $subtotal = 0.0;

            // 1. Validate items and stock
            $itemsToCreate = [];
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $unitPrice = $product->discount_price ?? $product->selling_price;
                $lineTotal = $unitPrice * $item['quantity'];
                $subtotal += $lineTotal;

                // Reserve inventory immediately
                $this->inventoryService->reserveStock($product->id, $data['location_id'], $item['quantity']);

                $itemsToCreate[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $lineTotal,
                ];
            }

            $discount = $data['discount_amount'] ?? 0.0;
            $vatRate = (float) SystemSetting::get('vat_rate', 16);
            $vat = (($subtotal - $discount) * $vatRate) / 100.0;
            $deliveryFee = $data['delivery_fee'] ?? 0.0;
            $grandTotal = ($subtotal - $discount) + $vat + $deliveryFee;

            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $customerId,
                'sales_agent_id' => $salesAgentId,
                'location_id' => $data['location_id'],
                'order_status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $data['payment_method'],
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'vat_amount' => $vat,
                'delivery_fee' => $deliveryFee,
                'total_amount' => $grandTotal,
                'delivery_address' => $data['delivery_address'],
            ]);

            foreach ($itemsToCreate as $itemData) {
                $order->items()->create($itemData);
            }

            return $order;
        }, 5);
    }

    /**
     * Transition order status (Pending -> Confirmed -> Packed -> Dispatched -> Delivered -> Completed)
     */
    public function updateOrderStatus(Order $order, string $newStatus, ?int $staffId = null): Order
    {
        return DB::transaction(function () use ($order, $newStatus, $staffId) {
            $oldStatus = $order->order_status;

            if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
                // Release reserved stock back to available pool
                foreach ($order->items as $item) {
                    $this->inventoryService->releaseReservedStock($item->product_id, $order->location_id, $item->quantity);
                }
                $order->update([
                    'order_status' => 'cancelled',
                    'cancelled_by' => $staffId,
                ]);
                return $order;
            }

            // When order is dispatched or completed, convert reservation into permanent deduction
            if (in_array($newStatus, ['dispatched', 'delivered', 'completed']) && !in_array($oldStatus, ['dispatched', 'delivered', 'completed'])) {
                foreach ($order->items as $item) {
                    $this->inventoryService->deductStockForSale(
                        $item->product_id,
                        $order->location_id,
                        $item->quantity,
                        $order->order_number,
                        $staffId
                    );
                }
            }

            $order->update(['order_status' => $newStatus]);
            return $order;
        }, 5);
    }

    /**
     * Convert an approved Quotation into an Invoice
     */
    public function convertQuotationToInvoice(Quotation $quotation, ?int $staffId = null): Invoice
    {
        return DB::transaction(function () use ($quotation, $staffId) {
            if ($quotation->status === 'converted') {
                throw new Exception("This quotation has already been converted into an invoice.");
            }

            $invNumber = DocumentNumberService::generateInvoiceNumber();

            $invoice = Invoice::create([
                'invoice_number' => $invNumber,
                'quotation_id' => $quotation->id,
                'customer_id' => $quotation->customer_id,
                'sales_agent_id' => $staffId ?? $quotation->sales_agent_id,
                'subtotal' => $quotation->subtotal,
                'discount_amount' => $quotation->discount_amount,
                'vat_amount' => $quotation->vat_amount,
                'total_amount' => $quotation->grand_total,
                'amount_paid' => 0.00,
                'balance_due' => $quotation->grand_total,
                'payment_status' => 'unpaid',
                'due_date' => now()->addDays(14),
            ]);

            foreach ($quotation->items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'sku' => $item->sku,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                ]);
            }

            $quotation->update(['status' => 'converted']);

            return $invoice;
        }, 5);
    }

    /**
     * Record a payment against an invoice (supports partial payments / deposits)
     */
    public function recordPayment(Invoice $invoice, array $paymentData, int $recordedByUserId): PaymentReceipt
    {
        return DB::transaction(function () use ($invoice, $paymentData, $recordedByUserId) {
            $recNumber = DocumentNumberService::generateReceiptNumber();
            $amount = (float) $paymentData['amount'];

            if ($amount <= 0) {
                throw new Exception("Payment amount must be greater than zero.");
            }

            if ($amount > $invoice->balance_due) {
                throw new Exception("Payment amount cannot exceed the remaining balance due (KES " . number_format($invoice->balance_due, 2) . ").");
            }

            $receipt = PaymentReceipt::create([
                'receipt_number' => $recNumber,
                'invoice_id' => $invoice->id,
                'order_id' => $invoice->order_id,
                'customer_id' => $invoice->customer_id,
                'amount' => $amount,
                'payment_method' => $paymentData['payment_method'],
                'transaction_reference' => strtoupper($paymentData['transaction_reference']),
                'recorded_by' => $recordedByUserId,
                'notes' => $paymentData['notes'] ?? null,
                'paid_at' => now(),
            ]);

            $newPaid = $invoice->amount_paid + $amount;
            $newBalance = $invoice->total_amount - $newPaid;
            $paymentStatus = ($newBalance <= 0) ? 'paid' : 'partially_paid';

            $invoice->update([
                'amount_paid' => $newPaid,
                'balance_due' => max(0, $newBalance),
                'payment_status' => $paymentStatus,
            ]);

            // Also update order payment status if linked
            if ($invoice->order) {
                $orderStatus = ($newBalance <= 0) ? 'paid' : 'partially_paid';
                $invoice->order->update([
                    'amount_paid' => $newPaid,
                    'payment_status' => $orderStatus,
                ]);
            }

            return $receipt;
        }, 5);
    }
}
