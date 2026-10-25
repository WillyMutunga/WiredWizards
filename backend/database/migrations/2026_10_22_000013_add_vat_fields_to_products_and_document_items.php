<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_vatable')->default(true)->after('discount_price');
            $table->decimal('vat_rate', 5, 2)->default(16.00)->after('is_vatable');
        });

        foreach (['order_items', 'quotation_items', 'invoice_items'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->boolean('is_vatable')->default(true)->after('unit_price');
                $table->decimal('vat_rate', 5, 2)->default(16.00)->after('is_vatable');
                $table->decimal('vat_amount', 12, 2)->default(0.00)->after('vat_rate');
            });
        }
    }

    public function down(): void
    {
        foreach (['order_items', 'quotation_items', 'invoice_items'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn(['is_vatable', 'vat_rate', 'vat_amount']);
            });
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['is_vatable', 'vat_rate']);
        });
    }
};
