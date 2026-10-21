<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->smallInteger('rating'); // 1 to 5
            $table->text('comment');
            $table->string('status', 30)->default('pending'); // pending, approved, rejected
            $table->timestamps();

            $table->index(['product_id', 'status']);
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_email', 255)->nullable();
            $table->string('action', 100);       // STOCK_ADJUSTMENT, PRICE_CHANGE, ROLE_CHANGE, ORDER_STATUS
            $table->string('entity_type', 100);  // Product, Inventory, Order, Invoice
            $table->bigInteger('entity_id');
            $table->jsonb('old_values')->nullable();
            $table->jsonb('new_values')->nullable();
            $table->string('ip_address', 50)->nullable();
            $table->timestamps();

            $table->index('action');
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('product_reviews');
    }
};
