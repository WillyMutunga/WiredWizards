<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('contact_person', 150)->nullable();
            $table->string('phone', 50);
            $table->string('email', 150)->nullable();
            $table->text('address')->nullable();
            $table->string('payment_terms', 100)->nullable(); // 30 Days Net, Cash, etc.
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('purchase_records', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_reference', 100)->unique(); // PUR-2026-0001
            $table->foreignId('supplier_id')->constrained('suppliers')->restrictOnDelete();
            $table->foreignId('location_id')->constrained('locations')->restrictOnDelete();
            $table->decimal('total_cost', 14, 2);
            $table->string('supplier_invoice_ref', 100)->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_record_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_record_id')->constrained('purchase_records')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->integer('quantity_received');
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('total_cost', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_record_items');
        Schema::dropIfExists('purchase_records');
        Schema::dropIfExists('suppliers');
    }
};
