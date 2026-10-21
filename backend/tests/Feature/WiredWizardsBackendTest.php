<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Location;
use App\Models\Quotation;
use App\Models\Invoice;

class WiredWizardsBackendTest extends TestCase
{
    public function test_public_product_catalogue(): void
    {
        $response = $this->getJson('/api/v1/products');
        $response->assertStatus(200);
        $response->assertJsonStructure(['data']);
    }

    public function test_product_comparison_api(): void
    {
        $products = Product::take(2)->pluck('id')->toArray();
        $ids = implode(',', $products);

        $response = $this->getJson("/api/v1/products/compare?ids={$ids}");
        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_auth_and_protected_inventory_matrix(): void
    {
        $admin = User::where('email', 'admin@wiredwizards.co.ke')->first();

        $response = $this->actingAs($admin)->getJson('/api/v1/inventory/matrix');
        $response->assertStatus(200);
        $response->assertJsonStructure(['locations', 'inventory']);
    }

    public function test_customer_checkout_and_stock_reservation(): void
    {
        $customer = User::where('email', 'peter@example.com')->first();
        $location = Location::where('code', 'MCK-RET')->first();
        $product = Product::first();

        $checkoutData = [
            'location_id' => $location->id,
            'payment_method' => 'mpesa_till',
            'delivery_address' => [
                'county' => 'Machakos',
                'town' => 'Machakos Town',
                'physical_details' => 'Near Central Police',
            ],
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ]
            ],
        ];

        $response = $this->actingAs($customer)->postJson('/api/v1/orders/checkout', $checkoutData);
        $response->assertStatus(201);
        $response->assertJsonPath('order.order_status', 'pending');
    }

    public function test_quotation_conversion_and_payment_recording(): void
    {
        $admin = User::where('email', 'admin@wiredwizards.co.ke')->first();
        $customer = User::where('email', 'peter@example.com')->first();
        $product = Product::first();

        // 1. Create Quote
        $quoteData = [
            'customer_id' => $customer->id,
            'valid_until' => now()->addDays(10)->toDateString(),
            'discount_amount' => 500,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ]
            ],
        ];

        $quoteRes = $this->actingAs($admin)->postJson('/api/v1/quotations', $quoteData);
        $quoteRes->assertStatus(201);
        $quoteId = $quoteRes->json('quotation.id');

        // 2. Convert to Invoice
        $invRes = $this->actingAs($admin)->postJson("/api/v1/quotations/{$quoteId}/convert-to-invoice");
        $invRes->assertStatus(200);
        $invoiceId = $invRes->json('invoice.id');

        // 3. Record Partial Deposit
        $paymentData = [
            'amount' => 5000,
            'payment_method' => 'mpesa_till',
            'transaction_reference' => 'QA99XYZ123',
            'notes' => 'Customer deposit via M-Pesa Till',
        ];

        $payRes = $this->actingAs($admin)->postJson("/api/v1/invoices/{$invoiceId}/record-payment", $paymentData);
        $payRes->assertStatus(201);
        $this->assertEquals('partially_paid', $payRes->json('invoice.payment_status'));
    }
}
