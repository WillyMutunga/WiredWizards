<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 100)->unique(); // ORD-2026-0001
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('sales_agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('location_id')->constrained('locations')->restrictOnDelete();
            $table->string('order_status', 50)->default('pending'); // pending, confirmed, processing, packed, dispatched, delivered, completed, cancelled
            $table->string('payment_status', 50)->default('pending'); // pending, partially_paid, paid, refunded
            $table->string('payment_method', 50); // mpesa_till, mpesa_stk, bank_transfer, cash_on_delivery
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->decimal('vat_amount', 12, 2)->default(0.00);
            $table->decimal('delivery_fee', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2);
            $table->decimal('amount_paid', 12, 2)->default(0.00);
            $table->jsonb('delivery_address');
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('customer_id');
            $table->index('order_status');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->string('product_name', 255);
            $table->string('sku', 100);
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
