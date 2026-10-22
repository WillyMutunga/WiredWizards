<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Invoice;
use App\Services\OrderWorkflowService;
use App\Services\DocumentNumberService;

class OrderController extends Controller
{
    protected OrderWorkflowService $orderWorkflow;

    public function __construct(OrderWorkflowService $orderWorkflow)
    {
        $this->orderWorkflow = $orderWorkflow;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::with(['items.product', 'location', 'customer'])
            ->latest();

        // Regular customer only sees their own orders
        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('order_status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    public function show(Request $request, $orderNumber)
    {
        $user = $request->user();
        $order = Order::with(['items.product', 'location', 'customer', 'invoice.payments'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        if ($user->role === 'customer' && $order->customer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access to this order.'], 403);
        }

        // Timeline visualization steps
        $timeline = [
            ['stage' => 'Order Received', 'done' => true, 'time' => $order->created_at->format('d M, H:i')],
            ['stage' => 'Payment Confirmed', 'done' => in_array($order->payment_status, ['partially_paid', 'paid'])],
            ['stage' => 'Processing', 'done' => in_array($order->order_status, ['processing', 'packed', 'dispatched', 'delivered', 'completed'])],
            ['stage' => 'Packed', 'done' => in_array($order->order_status, ['packed', 'dispatched', 'delivered', 'completed'])],
            ['stage' => 'Out for Delivery', 'done' => in_array($order->order_status, ['dispatched', 'delivered', 'completed'])],
            ['stage' => 'Delivered', 'done' => in_array($order->order_status, ['delivered', 'completed'])],
        ];

        return response()->json([
            'order' => $order,
            'timeline' => $timeline,
        ]);
    }

    /**
     * Storefront Checkout
     */
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'location_id' => 'required|exists:locations,id',
            'payment_method' => 'required|in:mpesa_till,mpesa_stk,bank_transfer,cash_on_delivery',
            'delivery_address' => 'required|array',
            'delivery_address.county' => 'required|string',
            'delivery_address.town' => 'required|string',
            'delivery_address.physical_details' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $customerId = $request->user()->id;
        $order = $this->orderWorkflow->createOrder($validated, $customerId);

        // Automatically create associated invoice for billing
        $invoice = Invoice::create([
            'invoice_number' => DocumentNumberService::generateInvoiceNumber(),
            'order_id' => $order->id,
            'customer_id' => $customerId,
            'subtotal' => $order->subtotal,
            'discount_amount' => $order->discount_amount,
            'vat_amount' => $order->vat_amount,
            'total_amount' => $order->total_amount,
            'amount_paid' => 0.00,
            'balance_due' => $order->total_amount,
            'payment_status' => 'unpaid',
            'due_date' => now()->addDays(7),
        ]);

        foreach ($order->items as $item) {
            $invoice->items()->create([
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'sku' => $item->sku,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total_price' => $item->total_price,
            ]);
        }

        return response()->json([
            'message' => 'Order created successfully and stock reserved.',
            'order' => $order->load('items'),
            'invoice' => $invoice,
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,packed,dispatched,delivered,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $updatedOrder = $this->orderWorkflow->updateOrderStatus($order, $validated['status'], $request->user()->id);

        return response()->json([
            'message' => "Order status updated to {$validated['status']}.",
            'order' => $updatedOrder,
        ]);
    }
}
