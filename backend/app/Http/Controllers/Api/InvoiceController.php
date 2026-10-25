<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Services\OrderWorkflowService;
use App\Services\PdfGeneratorService;

class InvoiceController extends Controller
{
    protected OrderWorkflowService $orderWorkflow;
    protected PdfGeneratorService $pdfService;

    public function __construct(OrderWorkflowService $orderWorkflow, PdfGeneratorService $pdfService)
    {
        $this->orderWorkflow = $orderWorkflow;
        $this->pdfService = $pdfService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Invoice::with(['customer', 'salesAgent', 'items', 'order'])
            ->latest();

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('payment_status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    public function show(Request $request, $id)
    {
        $invoice = Invoice::with(['customer.customerProfile', 'salesAgent', 'items', 'payments', 'order'])
            ->findOrFail($id);

        $this->ensureCanView($request, $invoice->customer_id);

        return response()->json($invoice);
    }

    /**
     * Record payment (full or deposit) against invoice
     */
    public function recordPayment(Request $request, $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:mpesa_till,mpesa_stk,bank_transfer,cash',
            'transaction_reference' => 'required|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $invoice = Invoice::findOrFail($id);
        $receipt = $this->orderWorkflow->recordPayment($invoice, $validated, $request->user()->id);

        return response()->json([
            'message' => 'Payment recorded successfully and official receipt generated.',
            'receipt' => $receipt->load(['invoice.items', 'order.items', 'customer']),
            'invoice' => $invoice->fresh(['items']),
        ], 201);
    }

    public function downloadPdf(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $this->ensureCanView($request, $invoice->customer_id);

        $pdf = $this->pdfService->renderInvoice($invoice);

        return $pdf->stream("{$invoice->invoice_number}.pdf");
    }
}
