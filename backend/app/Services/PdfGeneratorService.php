<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Quotation;
use App\Models\Invoice;
use App\Models\PaymentReceipt;
use Illuminate\Support\Facades\Storage;

class PdfGeneratorService
{
    public function renderQuotation(Quotation $quotation)
    {
        $quotation->load(['customer.customerProfile', 'salesAgent', 'items']);
        return Pdf::loadView('pdf.quotation', compact('quotation'))->setPaper('a4', 'portrait');
    }

    public function renderInvoice(Invoice $invoice)
    {
        $invoice->load(['customer.customerProfile', 'salesAgent', 'items', 'order', 'quotation']);
        return Pdf::loadView('pdf.invoice', compact('invoice'))->setPaper('a4', 'portrait');
    }

    public function renderReceipt(PaymentReceipt $receipt)
    {
        $receipt->load(['customer.customerProfile', 'recorder', 'invoice', 'order']);
        return Pdf::loadView('pdf.receipt', compact('receipt'))->setPaper('a4', 'portrait');
    }
}
