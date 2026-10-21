<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

@mkdir('C:/Users/hp/Desktop/Wired Wizards/sample_documents', 0777, true);
$pdfService = new App\Services\PdfGeneratorService();

$invoice = App\Models\Invoice::first();
if ($invoice) {
    $pdf = $pdfService->renderInvoice($invoice);
    file_put_contents('C:/Users/hp/Desktop/Wired Wizards/sample_documents/Sample_Invoice_' . $invoice->invoice_number . '.pdf', $pdf->output());
    echo "Saved: Sample_Invoice_{$invoice->invoice_number}.pdf\n";
}

$quotation = App\Models\Quotation::first();
if ($quotation) {
    $pdf = $pdfService->renderQuotation($quotation);
    file_put_contents('C:/Users/hp/Desktop/Wired Wizards/sample_documents/Sample_Quotation_' . $quotation->quotation_number . '.pdf', $pdf->output());
    echo "Saved: Sample_Quotation_{$quotation->quotation_number}.pdf\n";
}

$receipt = App\Models\PaymentReceipt::first();
if ($receipt) {
    $pdf = $pdfService->renderReceipt($receipt);
    file_put_contents('C:/Users/hp/Desktop/Wired Wizards/sample_documents/Sample_Receipt_' . $receipt->receipt_number . '.pdf', $pdf->output());
    echo "Saved: Sample_Receipt_{$receipt->receipt_number}.pdf\n";
}
