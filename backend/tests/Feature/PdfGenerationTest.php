<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Quotation;
use App\Models\Invoice;
use App\Models\PaymentReceipt;

class PdfGenerationTest extends TestCase
{
    public function test_invoice_and_quotation_pdf_streams(): void
    {
        $admin = User::where('email', 'admin@wiredwizards.co.ke')->first();
        $invoice = Invoice::first();
        $quotation = Quotation::first();
        $receipt = PaymentReceipt::first();

        if ($quotation) {
            $quotePdf = $this->actingAs($admin)->get("/api/v1/quotations/{$quotation->id}/pdf");
            $quotePdf->assertStatus(200);
            $this->assertEquals('application/pdf', $quotePdf->headers->get('content-type'));
        }

        if ($invoice) {
            $invPdf = $this->actingAs($admin)->get("/api/v1/invoices/{$invoice->id}/pdf");
            $invPdf->assertStatus(200);
            $this->assertEquals('application/pdf', $invPdf->headers->get('content-type'));
        }

        if ($receipt) {
            $recPdf = $this->actingAs($admin)->get("/api/v1/receipts/{$receipt->id}/pdf");
            $recPdf->assertStatus(200);
            $this->assertEquals('application/pdf', $recPdf->headers->get('content-type'));
        }
    }
}
