<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentReceipt;
use App\Services\PdfGeneratorService;

class PaymentReceiptController extends Controller
{
    protected PdfGeneratorService $pdfService;

    public function __construct(PdfGeneratorService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = PaymentReceipt::with(['customer', 'invoice.items', 'order.items', 'recorder'])
            ->latest();

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        }

        return response()->json($query->paginate(15));
    }

    public function show(Request $request, $id)
    {
        $receipt = PaymentReceipt::with(['customer.customerProfile', 'invoice.items', 'order.items', 'recorder'])
            ->findOrFail($id);

        $this->ensureCanView($request, $receipt->customer_id);

        return response()->json($receipt);
    }

    public function downloadPdf(Request $request, $id)
    {
        $receipt = PaymentReceipt::findOrFail($id);
        $this->ensureCanView($request, $receipt->customer_id);

        $pdf = $this->pdfService->renderReceipt($receipt);

        return $pdf->stream("{$receipt->receipt_number}.pdf");
    }
}
