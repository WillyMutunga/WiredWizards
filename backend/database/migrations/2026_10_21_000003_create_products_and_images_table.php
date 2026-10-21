<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->string('sku', 100)->unique();
            $table->string('barcode', 100)->nullable()->unique();
            $table->string('name', 255);
            $table->string('slug', 280)->unique();
            $table->text('short_description')->nullable();
            $table->text('description');
            $table->decimal('buying_price', 12, 2); // Restricted to Super Admin / Inventory Manager
            $table->decimal('selling_price', 12, 2);
            $table->decimal('discount_price', 12, 2)->nullable();
            $table->string('warranty_period', 100)->default('1 Year');
            $table->string('datasheet_url')->nullable();
            $table->integer('min_stock_alert')->default(5);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->jsonb('technical_specs')->default('{}'); // JSONB for wattage, voltage, cell_type, etc.
            $table->timestamps();

            $table->index('category_id');
            $table->index('brand_id');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('image_path', 255);
            $table->boolean('is_primary')->default(false);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
    }
};
