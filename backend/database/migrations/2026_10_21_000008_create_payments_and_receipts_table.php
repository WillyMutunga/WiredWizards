<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments_and_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number', 100)->unique(); // REC-2026-0001
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('payment_method', 50);          // mpesa_till, mpesa_stk, bank_transfer, cash
            $table->string('transaction_reference', 100);  // M-Pesa transaction ID, Bank slip number
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamp('paid_at')->useCurrent();
            $table->timestamps();

            $table->index('receipt_number');
            $table->index('transaction_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments_and_receipts');
    }
};
