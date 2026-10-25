<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuotationItem extends Model
{
    protected $fillable = [
        'quotation_id',
        'product_id',
        'product_name',
        'sku',
        'quantity',
        'unit_price',
        'is_vatable',
        'vat_rate',
        'vat_amount',
        'total_price',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'is_vatable' => 'boolean',
        'vat_rate' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
