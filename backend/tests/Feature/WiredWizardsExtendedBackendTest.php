<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\CustomerAddress;
use App\Models\SystemSetting;
use App\Models\ProductReview;

class WiredWizardsExtendedBackendTest extends TestCase
{
    public function test_wishlist_toggle(): void
    {
        $customer = User::where('email', 'peter@example.com')->first();
        $product = Product::first();

        // 1. Add to wishlist
        $res1 = $this->actingAs($customer)->postJson('/api/v1/wishlist/toggle', ['product_id' => $product->id]);
        $res1->assertStatus(201);
        $this->assertTrue($res1->json('in_wishlist'));

        // 2. Remove by toggling again
        $res2 = $this->actingAs($customer)->postJson('/api/v1/wishlist/toggle', ['product_id' => $product->id]);
        $res2->assertStatus(200);
        $this->assertFalse($res2->json('in_wishlist'));
    }

    public function test_customer_address_management(): void
    {
        $customer = User::where('email', 'peter@example.com')->first();

        $res = $this->actingAs($customer)->postJson('/api/v1/addresses', [
            'label' => 'Kitui Installation Branch',
            'county' => 'Kitui',
            'town' => 'Kitui Town',
            'physical_details' => 'Near General Hospital',
            'is_default' => false,
        ]);

        $res->assertStatus(201);
        $addressId = $res->json('address.id');

        // Delete address
        $delRes = $this->actingAs($customer)->deleteJson("/api/v1/addresses/{$addressId}");
        $delRes->assertStatus(200);
    }

    public function test_product_review_and_staff_moderation(): void
    {
        $customer = User::where('email', 'peter@example.com')->first();
        $admin = User::where('email', 'admin@wiredwizards.co.ke')->first();
        $product = Product::first();

        // 1. Customer submits review
        $revRes = $this->actingAs($customer)->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 5,
            'comment' => 'Excellent 550W panel, working perfectly on my farm in Machakos!',
        ]);
        $revRes->assertStatus(201);
        $reviewId = $revRes->json('review.id');

        // 2. Admin approves review
        $modRes = $this->actingAs($admin)->putJson("/api/v1/admin/reviews/{$reviewId}/status", [
            'status' => 'approved',
        ]);
        $modRes->assertStatus(200);
        $this->assertEquals('approved', $modRes->json('review.status'));
    }

    public function test_whatsapp_link_generation(): void
    {
        $product = Product::first();
        $res = $this->getJson("/api/v1/whatsapp/product/{$product->id}");
        $res->assertStatus(200);
        $this->assertStringContainsString('https://wa.me/', $res->json('link'));
    }

    public function test_settings_update_by_admin(): void
    {
        $admin = User::where('email', 'admin@wiredwizards.co.ke')->first();

        $res = $this->actingAs($admin)->putJson('/api/v1/admin/settings', [
            'settings' => [
                'mpesa_till' => '543210',
                'vat_rate' => '16',
            ]
        ]);

        $res->assertStatus(200);
        $this->assertEquals('543210', $res->json('settings.mpesa_till'));
    }

    public function test_mpesa_stk_push_initiation(): void
    {
        $customer = User::where('email', 'peter@example.com')->first();
        $location = \App\Models\Location::where('code', 'MCK-RET')->first();
        $product = Product::first();

        $checkoutRes = $this->actingAs($customer)->postJson('/api/v1/orders/checkout', [
            'location_id' => $location->id,
            'payment_method' => 'mpesa_stk',
            'delivery_address' => ['county' => 'Machakos', 'town' => 'Machakos Town', 'physical_details' => 'Plot 4'],
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(201);

        $orderId = $checkoutRes->json('order.id');

        $res = $this->actingAs($customer)->postJson('/api/v1/payments/mpesa/stkpush', [
            'phone' => '0712345678',
            'amount' => 5000,
            'order_id' => $orderId,
        ]);

        $res->assertStatus(200);
        $this->assertArrayHasKey('daraja_response', $res->json());
    }
}
