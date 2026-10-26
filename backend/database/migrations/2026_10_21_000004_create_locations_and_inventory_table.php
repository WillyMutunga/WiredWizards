<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);       // Nairobi Warehouse, Machakos Store, Kitui Store
            $table->string('code', 30)->unique(); // NBO-WH, MCK-RET, KTU-RET
            $table->string('location_type', 50); // warehouse, retail_store
            $table->string('county', 100);
            $table->string('town', 100);
            $table->text('address');
            $table->string('phone', 30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('location_id')->constrained('locations')->restrictOnDelete();
            $table->integer('quantity_on_hand')->default(0);
            $table->integer('quantity_reserved')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'location_id']);
        });

        // Add Check constraints on PostgreSQL/MySQL to guarantee stock never drops below zero
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE inventory ADD CONSTRAINT chk_inventory_on_hand CHECK (quantity_on_hand >= 0);');
            DB::statement('ALTER TABLE inventory ADD CONSTRAINT chk_inventory_reserved CHECK (quantity_reserved >= 0);');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory');
        Schema::dropIfExists('locations');
    }
};
