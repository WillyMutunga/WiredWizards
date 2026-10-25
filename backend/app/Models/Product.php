<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'brand_id',
        'sku',
        'barcode',
        'name',
        'slug',
        'short_description',
        'description',
        'buying_price',
        'selling_price',
        'discount_price',
        'is_vatable',
        'vat_rate',
        'warranty_period',
        'datasheet_url',
        'min_stock_alert',
        'is_featured',
        'is_active',
        'technical_specs',
    ];

    protected $casts = [
        'buying_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'is_vatable' => 'boolean',
        'vat_rate' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'technical_specs' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('display_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class);
    }

    public function totalOnHand(): int
    {
        return (int) $this->inventory()->sum('quantity_on_hand');
    }

    public function totalReserved(): int
    {
        return (int) $this->inventory()->sum('quantity_reserved');
    }

    public function totalAvailable(): int
    {
        return max(0, $this->totalOnHand() - $this->totalReserved());
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }
}
