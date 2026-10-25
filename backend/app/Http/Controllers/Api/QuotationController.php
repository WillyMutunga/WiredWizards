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
use App\Exceptions\BusinessRuleException;

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
            $user = $request->user();
            $isAdmin = $user->role === 'super_admin';
            $capPercent = (float) SystemSetting::get('max_agent_discount_percent', 10);

            $subtotal = 0.0;
            $listTotal = 0.0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $listPrice = (float) ($product->discount_price ?? $product->selling_price);
                $price = isset($item['unit_price']) ? (float) $item['unit_price'] : $listPrice;

                if (!$isAdmin && $price < (float) $product->buying_price) {
                    throw new BusinessRuleException("The price for {$product->name} is below the allowed minimum.");
                }

                $lineTotal = $price * $item['quantity'];
                $subtotal += $lineTotal;
                $listTotal += $listPrice * $item['quantity'];

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $item['quantity'],
                    'unit_price' => $price,
                    'is_vatable' => (bool) $product->is_vatable,
                    'vat_rate' => $product->is_vatable ? (float) $product->vat_rate : 0.0,
                    'vat_amount' => 0.0, // computed below after discount proration
                    'total_price' => $lineTotal,
                ];
            }

            $discount = (float) ($validated['discount_amount'] ?? 0.0);
            if ($discount > $subtotal) {
                throw new BusinessRuleException('Discount cannot exceed the quotation subtotal.');
            }

            // Sales agents: total reduction from list price (price overrides + discount) is capped
            if (!$isAdmin) {
                $minAllowed = $listTotal * (1 - $capPercent / 100);
                if (($subtotal - $discount) < $minAllowed - 0.01) {
                    throw new BusinessRuleException("Total discount exceeds your limit of {$capPercent}%. Ask a super admin to approve a larger discount.");
                }
            }

            // Compute VAT only on VATable items, prorating any overall quotation discount
            $discountRatio = $subtotal > 0 ? ($subtotal - $discount) / $subtotal : 1.0;
            $vat = 0.0;
            foreach ($itemsData as &$row) {
                if ($row['is_vatable'] && $row['vat_rate'] > 0) {
                    $taxableLine = $row['total_price'] * $discountRatio;
                    $row['vat_amount'] = round(($taxableLine * $row['vat_rate']) / 100.0, 2);
                    $vat += $row['vat_amount'];
                }
            }
            unset($row);

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

    public function downloadPdf(Request $request, $id)
    {
        $quotation = Quotation::findOrFail($id);
        $this->ensureCanView($request, $quotation->customer_id);

        $pdf = $this->pdfService->renderQuotation($quotation);

        return $pdf->stream("{$quotation->quotation_number}.pdf");
    }
}
