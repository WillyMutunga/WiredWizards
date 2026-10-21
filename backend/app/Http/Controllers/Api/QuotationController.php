<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Quotation;
use App\Models\Product;
use App\Models\SystemSetting;
use App\Services\DocumentNumberService;
use App\Services\OrderWorkflowService;
use App\Services\PdfGeneratorService;
use Illuminate\Support\Facades\DB;

class QuotationController extends Controller
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
        $query = Quotation::with(['customer', 'salesAgent', 'items'])
            ->latest();

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'valid_until' => 'required|date|after:today',
            'discount_amount' => 'nullable|numeric|min:0',
            'delivery_fee' => 'nullable|numeric|min:0',
            'terms_and_conditions' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0', // Allows authorized sales agent price override
        ]);

        $quotation = DB::transaction(function () use ($validated, $request) {
            $subtotal = 0.0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $price = $item['unit_price'] ?? ($product->discount_price ?? $product->selling_price);
                $lineTotal = $price * $item['quantity'];
                $subtotal += $lineTotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $item['quantity'],
                    'unit_price' => $price,
                    'total_price' => $lineTotal,
                ];
            }

            $discount = $validated['discount_amount'] ?? 0.0;
            $vatRate = (float) SystemSetting::get('vat_rate', 16);
            $vat = (($subtotal - $discount) * $vatRate) / 100.0;
            $grandTotal = ($subtotal - $discount) + $vat + ($validated['delivery_fee'] ?? 0.0);

            $quote = Quotation::create([
                'quotation_number' => DocumentNumberService::generateQuotationNumber(),
                'customer_id' => $validated['customer_id'],
                'sales_agent_id' => $request->user()->id,
                'status' => 'draft',
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'vat_amount' => $vat,
                'delivery_fee' => $validated['delivery_fee'] ?? 0.0,
                'grand_total' => $grandTotal,
                'valid_until' => $validated['valid_until'],
                'terms_and_conditions' => $validated['terms_and_conditions'] ?? null,
            ]);

            foreach ($itemsData as $row) {
                $quote->items()->create($row);
            }

            return $quote;
        });

        return response()->json([
            'message' => 'Quotation generated successfully.',
            'quotation' => $quotation->load(['customer', 'items']),
        ], 201);
    }

    public function convertToInvoice(Request $request, $id)
    {
        $quotation = Quotation::with('items')->findOrFail($id);
        $invoice = $this->orderWorkflow->convertQuotationToInvoice($quotation, $request->user()->id);

        return response()->json([
            'message' => 'Quotation successfully converted into Tax Invoice.',
            'invoice' => $invoice->load(['customer', 'items']),
        ]);
    }

    public function downloadPdf($id)
    {
        $quotation = Quotation::findOrFail($id);
        $pdf = $this->pdfService->renderQuotation($quotation);

        return $pdf->stream("{$quotation->quotation_number}.pdf");
    }
}
