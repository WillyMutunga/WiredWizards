<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Location;
use App\Models\Inventory;
use App\Models\StockMovement;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class BackendSecurityAndHardeningTest extends TestCase
{
    public function test_role_middleware_blocks_unauthorized_roles(): void
    {
        $customer = User::where('email', 'peter@example.com')->first();
        $agent = User::where('email', 'sales@wiredwizards.co.ke')->first();
        $invManager = User::where('email', 'inventory@wiredwizards.co.ke')->first();

        // Customer blocked from staff/admin endpoints
        $this->actingAs($customer)->getJson('/api/v1/admin/users')->assertStatus(403);
        $this->actingAs($customer)->getJson('/api/v1/inventory/matrix')->assertStatus(403);
        $this->actingAs($customer)->postJson('/api/v1/quotations', [])->assertStatus(403);

        // Sales Agent blocked from inventory write & super_admin endpoints
        $this->actingAs($agent)->postJson('/api/v1/inventory/stock-in', [])->assertStatus(403);
        $this->actingAs($agent)->putJson('/api/v1/admin/settings', ['settings' => []])->assertStatus(403);
        $this->actingAs($agent)->getJson('/api/v1/reports/valuation')->assertStatus(403);

        // Inventory Manager allowed on inventory, blocked on super_admin valuation & user management
        $this->actingAs($invManager)->getJson('/api/v1/inventory/matrix')->assertStatus(200);
        $this->actingAs($invManager)->getJson('/api/v1/reports/valuation')->assertStatus(403);
        $this->actingAs($invManager)->getJson('/api/v1/admin/users')->assertStatus(403);
    }

    public function test_checkout_ignores_client_discount_and_enforces_agent_discount_caps(): void
    {
        $customer = User::where('email', 'peter@example.com')->first();
        $agent = User::where('email', 'sales@wiredwizards.co.ke')->first();
        $admin = User::where('email', 'admin@wiredwizards.co.ke')->first();
        $location = Location::where('code', 'MCK-RET')->first();
        $product = Product::first(); // selling 16500, discount_price 15500, buying_price 12500

        // 1. Customer tries to pass discount_amount at checkout -> ignored
        $orderRes = $this->actingAs($customer)->postJson('/api/v1/orders/checkout', [
            'location_id' => $location->id,
            'payment_method' => 'mpesa_till',
            'discount_amount' => 15000,
            'delivery_address' => ['county' => 'Machakos', 'town' => 'Machakos', 'physical_details' => 'Main St'],
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(201);

        $this->assertEquals(0.0, (float) $orderRes->json('order.discount_amount'));

        // 2. Sales agent tries to give >10% discount -> rejected (422)
        $this->actingAs($agent)->postJson('/api/v1/quotations', [
            'customer_id' => $customer->id,
            'valid_until' => now()->addDays(7)->toDateString(),
            'discount_amount' => 3000, // > 10% of 15,500
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(422);

        // 3. Sales agent tries to set unit_price below buying_price (12,500) -> rejected (422)
        $this->actingAs($agent)->postJson('/api/v1/quotations', [
            'customer_id' => $customer->id,
            'valid_until' => now()->addDays(7)->toDateString(),
            'items' => [['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 11000]],
        ])->assertStatus(422);

        // 4. Super Admin can give >10% discount
        $this->actingAs($admin)->postJson('/api/v1/quotations', [
            'customer_id' => $customer->id,
            'valid_until' => now()->addDays(7)->toDateString(),
            'discount_amount' => 3000,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(201);
    }

    public function test_document_idor_protection_blocks_other_customers(): void
    {
        $peter = User::where('email', 'peter@example.com')->first();
        $otherCustomer = User::create([
            'name' => 'Jane Wambui',
            'email' => 'jane@example.com',
            'phone' => '+254799887766',
            'role' => 'customer',
            'password' => Hash::make('Customer@2026'),
            'is_active' => true,
        ]);
        $admin = User::where('email', 'admin@wiredwizards.co.ke')->first();
        $product = Product::first();

        $quoteRes = $this->actingAs($admin)->postJson('/api/v1/quotations', [
            'customer_id' => $peter->id,
            'valid_until' => now()->addDays(7)->toDateString(),
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(201);
        $quoteId = $quoteRes->json('quotation.id');

        $invRes = $this->actingAs($admin)->postJson("/api/v1/quotations/{$quoteId}/convert-to-invoice")->assertStatus(200);
        $invId = $invRes->json('invoice.id');

        $payRes = $this->actingAs($admin)->postJson("/api/v1/invoices/{$invId}/record-payment", [
            'amount' => 1000,
            'payment_method' => 'mpesa_till',
            'transaction_reference' => 'IDOR12345',
        ])->assertStatus(201);
        $recId = $payRes->json('receipt.id');

        // Peter (owner) can download his PDFs
        $this->actingAs($peter)->get("/api/v1/quotations/{$quoteId}/pdf")->assertStatus(200);
        $this->actingAs($peter)->get("/api/v1/invoices/{$invId}/pdf")->assertStatus(200);
        $this->actingAs($peter)->get("/api/v1/receipts/{$recId}/pdf")->assertStatus(200);

        // Jane (another customer) gets 403 on all of Peter's documents
        $this->actingAs($otherCustomer)->get("/api/v1/quotations/{$quoteId}/pdf")->assertStatus(403);
        $this->actingAs($otherCustomer)->getJson("/api/v1/invoices/{$invId}")->assertStatus(403);
        $this->actingAs($otherCustomer)->get("/api/v1/invoices/{$invId}/pdf")->assertStatus(403);
        $this->actingAs($otherCustomer)->get("/api/v1/receipts/{$recId}/pdf")->assertStatus(403);
    }

    public function test_stock_transfer_initiate_dispatch_and_receive(): void
    {
        $invManager = User::where('email', 'inventory@wiredwizards.co.ke')->first();
        $nbo = Location::where('code', 'NBO-WH')->first();
        $mck = Location::where('code', 'MCK-RET')->first();
        $product = Product::first();

        $nboBefore = Inventory::where('product_id', $product->id)->where('location_id', $nbo->id)->value('quantity_on_hand');
        $mckBefore = Inventory::where('product_id', $product->id)->where('location_id', $mck->id)->value('quantity_on_hand');

        // 1. Initiate transfer of 5 units from Nairobi to Machakos
        $initRes = $this->actingAs($invManager)->postJson('/api/v1/transfers/initiate', [
            'source_location_id' => $nbo->id,
            'destination_location_id' => $mck->id,
            'items' => [['product_id' => $product->id, 'quantity' => 5]],
        ])->assertStatus(201);
        $transferId = $initRes->json('transfer.id');
        $transferNumber = $initRes->json('transfer.transfer_number');

        // 2. Dispatch transfer
        $this->actingAs($invManager)->putJson("/api/v1/transfers/{$transferId}/dispatch")->assertStatus(200);
        $this->assertEquals($nboBefore - 5, Inventory::where('product_id', $product->id)->where('location_id', $nbo->id)->value('quantity_on_hand'));
        $this->assertTrue(StockMovement::where('reference_number', $transferNumber)->where('movement_type', 'transfer_out')->exists());

        // 3. Receive transfer at Machakos
        $this->actingAs($invManager)->putJson("/api/v1/transfers/{$transferId}/receive")->assertStatus(200);
        $this->assertEquals($mckBefore + 5, Inventory::where('product_id', $product->id)->where('location_id', $mck->id)->value('quantity_on_hand'));
        $this->assertTrue(StockMovement::where('reference_number', $transferNumber)->where('movement_type', 'transfer_in')->exists());
    }

    public function test_only_approved_reviews_appear_on_public_product_page(): void
    {
        $customer = User::where('email', 'peter@example.com')->first();
        $admin = User::where('email', 'admin@wiredwizards.co.ke')->first();
        $product = Product::first();

        $revRes = $this->actingAs($customer)->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 4,
            'comment' => 'Great solar panel output even on cloudy days.',
        ])->assertStatus(201);
        $reviewId = $revRes->json('review.id');

        // While pending, public product show must have 0 visible reviews
        $pub1 = $this->getJson("/api/v1/products/{$product->slug}")->assertStatus(200);
        $this->assertEquals(0, $pub1->json('data.reviews.count'));

        // Approve review
        $this->actingAs($admin)->putJson("/api/v1/admin/reviews/{$reviewId}/status", ['status' => 'approved'])->assertStatus(200);

        $pub2 = $this->getJson("/api/v1/products/{$product->slug}")->assertStatus(200);
        $this->assertEquals(1, $pub2->json('data.reviews.count'));
        $this->assertEquals(4.0, $pub2->json('data.reviews.average_rating'));
    }

    public function test_product_media_upload_and_catalog_crud(): void
    {
        Storage::fake('public');
        $invManager = User::where('email', 'inventory@wiredwizards.co.ke')->first();
        $product = Product::first();

        // Upload image
        $imgRes = $this->actingAs($invManager)->postJson("/api/v1/products/{$product->id}/images", [
            'images' => [UploadedFile::fake()->image('panel.jpg', 600, 600)],
        ])->assertStatus(201);
        $this->assertCount(1, $imgRes->json('images'));

        // Upload PDF datasheet
        $pdfRes = $this->actingAs($invManager)->postJson("/api/v1/products/{$product->id}/datasheet", [
            'datasheet' => UploadedFile::fake()->create('datasheet.pdf', 200, 'application/pdf'),
        ])->assertStatus(201);
        $this->assertStringContainsString('datasheets/', $pdfRes->json('datasheet_url'));

        // Create Category, Brand & Supplier
        $this->actingAs($invManager)->postJson('/api/v1/categories', ['name' => 'Mounting Structures'])->assertStatus(201);
        $this->actingAs($invManager)->postJson('/api/v1/brands', ['name' => 'Victron Energy'])->assertStatus(201);
        $this->actingAs($invManager)->postJson('/api/v1/suppliers', [
            'name' => 'East Africa Solar Imports',
            'phone' => '+254711223344',
        ])->assertStatus(201);
    }

    public function test_per_product_vat_creation_display_mixed_order_and_receipting(): void
    {
        $invManager = User::where('email', 'inventory@wiredwizards.co.ke')->first();
        $admin = User::where('email', 'admin@wiredwizards.co.ke')->first();
        $customer = User::where('email', 'peter@example.com')->first();
        $location = Location::where('code', 'MCK-RET')->first();
        $categoryId = Product::first()->category_id;

        // 1. Create a Non-VAT Solar Product during product creation
        $nonVatRes = $this->actingAs($invManager)->postJson('/api/v1/products', [
            'category_id' => $categoryId,
            'sku' => 'SOL-NONVAT-TEST-01',
            'name' => 'Canadian Solar 600W Bi-Facial Panel',
            'description' => 'High efficiency monocrystalline bi-facial solar module (VAT Exempt).',
            'buying_price' => 14000,
            'selling_price' => 20000,
            'is_vatable' => false,
        ])->assertStatus(201);

        $this->assertFalse($nonVatRes->json('data.is_vatable'));
        $this->assertEquals(0.0, (float) $nonVatRes->json('data.vat_rate'));
        $this->assertEquals('VAT Exempt (Non-VAT)', $nonVatRes->json('data.vat_status'));

        // 2. Create a VAT-Compliant Accessory Product during product creation
        $vatRes = $this->actingAs($invManager)->postJson('/api/v1/products', [
            'category_id' => $categoryId,
            'sku' => 'SOL-VAT-TEST-02',
            'name' => 'Smart WiFi Energy Meter & Surge Protector',
            'description' => 'DIN-rail smart energy meter with surge protection (16% VAT).',
            'buying_price' => 6000,
            'selling_price' => 10000,
            'is_vatable' => true,
            'vat_rate' => 16.00,
        ])->assertStatus(201);

        $this->assertTrue($vatRes->json('data.is_vatable'));
        $this->assertEquals(16.0, (float) $vatRes->json('data.vat_rate'));
        $this->assertEquals('VATable (16%)', $vatRes->json('data.vat_status'));

        $nonVatProductId = $nonVatRes->json('data.id');
        $vatProductId = $vatRes->json('data.id');

        // Seed stock at Machakos for both products
        Inventory::create(['product_id' => $nonVatProductId, 'location_id' => $location->id, 'quantity_on_hand' => 10, 'quantity_reserved' => 0]);
        Inventory::create(['product_id' => $vatProductId, 'location_id' => $location->id, 'quantity_on_hand' => 10, 'quantity_reserved' => 0]);

        // 3. Verify Customer Viewing Product sees clear VAT status
        $showNonVat = $this->getJson("/api/v1/products/{$nonVatProductId}")->assertStatus(200);
        $this->assertFalse($showNonVat->json('data.is_vatable'));
        $this->assertEquals('VAT Exempt (Non-VAT)', $showNonVat->json('data.vat_status'));

        $showVat = $this->getJson("/api/v1/products/{$vatProductId}")->assertStatus(200);
        $this->assertTrue($showVat->json('data.is_vatable'));
        $this->assertEquals('VATable (16%)', $showVat->json('data.vat_status'));

        // 4. Customer Checkout with Mixed Cart (1 Non-VAT @ 20,000 + 1 VATable @ 10,000)
        // Expected: Subtotal = 30,000; VAT = 16% of 10,000 ONLY = 1,600; Grand Total = 31,600
        $orderRes = $this->actingAs($customer)->postJson('/api/v1/orders/checkout', [
            'location_id' => $location->id,
            'payment_method' => 'mpesa_till',
            'delivery_address' => ['county' => 'Machakos', 'town' => 'Machakos', 'physical_details' => 'Syokimau Rd'],
            'items' => [
                ['product_id' => $nonVatProductId, 'quantity' => 1],
                ['product_id' => $vatProductId, 'quantity' => 1],
            ],
        ])->assertStatus(201);

        $this->assertEquals(30000.0, (float) $orderRes->json('order.subtotal'));
        $this->assertEquals(1600.0, (float) $orderRes->json('order.vat_amount'));
        $this->assertEquals(31600.0, (float) $orderRes->json('order.total_amount'));

        // 5. Quotation -> Invoice -> Payment Receipt with Mixed Items
        $quoteRes = $this->actingAs($admin)->postJson('/api/v1/quotations', [
            'customer_id' => $customer->id,
            'valid_until' => now()->addDays(7)->toDateString(),
            'items' => [
                ['product_id' => $nonVatProductId, 'quantity' => 1],
                ['product_id' => $vatProductId, 'quantity' => 1],
            ],
        ])->assertStatus(201);

        $this->assertEquals(1600.0, (float) $quoteRes->json('quotation.vat_amount'));
        $this->assertEquals(31600.0, (float) $quoteRes->json('quotation.grand_total'));
        $quoteId = $quoteRes->json('quotation.id');

        $invRes = $this->actingAs($admin)->postJson("/api/v1/quotations/{$quoteId}/convert-to-invoice")->assertStatus(200);
        $invId = $invRes->json('invoice.id');
        $this->assertEquals(1600.0, (float) $invRes->json('invoice.vat_amount'));

        // Record Payment and check Receipting JSON & PDF
        $payRes = $this->actingAs($admin)->postJson("/api/v1/invoices/{$invId}/record-payment", [
            'amount' => 31600,
            'payment_method' => 'mpesa_till',
            'transaction_reference' => 'VATRECEIPT001',
        ])->assertStatus(201);

        $receiptId = $payRes->json('receipt.id');
        $receiptItems = collect($payRes->json('receipt.invoice.items'));
        $this->assertCount(2, $receiptItems);

        $nonVatLine = $receiptItems->firstWhere('sku', 'SOL-NONVAT-TEST-01');
        $vatLine = $receiptItems->firstWhere('sku', 'SOL-VAT-TEST-02');

        $this->assertFalse($nonVatLine['is_vatable']);
        $this->assertEquals(0.0, (float) $nonVatLine['vat_amount']);
        $this->assertTrue($vatLine['is_vatable']);
        $this->assertEquals(1600.0, (float) $vatLine['vat_amount']);

        // Verify Receipt Show API & PDF Stream succeed
        $this->actingAs($customer)->getJson("/api/v1/receipts/{$receiptId}")->assertStatus(200);
        $this->actingAs($customer)->get("/api/v1/receipts/{$receiptId}/pdf")->assertStatus(200);
    }
}
