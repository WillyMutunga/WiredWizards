<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;

class PdfGenerationTest extends TestCase
{
    public function test_invoice_and_quotation_pdf_streams(): void
    {
        $admin = User::where('email', 'admin@wiredwizards.co.ke')->first();
        $customer = User::where('email', 'peter@example.com')->first();
        $product = Product::first();

        // Create quotation -> invoice -> payment receipt
        $quoteRes = $this->actingAs($admin)->postJson('/api/v1/quotations', [
            'customer_id' => $customer->id,
            'valid_until' => now()->addDays(10)->toDateString(),
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(201);
        $quoteId = $quoteRes->json('quotation.id');

        $invRes = $this->actingAs($admin)->postJson("/api/v1/quotations/{$quoteId}/convert-to-invoice")
            ->assertStatus(200);
        $invoiceId = $invRes->json('invoice.id');

        $payRes = $this->actingAs($admin)->postJson("/api/v1/invoices/{$invoiceId}/record-payment", [
            'amount' => 5000,
            'payment_method' => 'mpesa_till',
            'transaction_reference' => 'PDFTEST123',
        ])->assertStatus(201);
        $receiptId = $payRes->json('receipt.id');

        $quotePdf = $this->actingAs($admin)->get("/api/v1/quotations/{$quoteId}/pdf");
        $quotePdf->assertStatus(200);
        $this->assertEquals('application/pdf', $quotePdf->headers->get('content-type'));

        $invPdf = $this->actingAs($admin)->get("/api/v1/invoices/{$invoiceId}/pdf");
        $invPdf->assertStatus(200);
        $this->assertEquals('application/pdf', $invPdf->headers->get('content-type'));

        $recPdf = $this->actingAs($admin)->get("/api/v1/receipts/{$receiptId}/pdf");
        $recPdf->assertStatus(200);
        $this->assertEquals('application/pdf', $recPdf->headers->get('content-type'));
    }
}
