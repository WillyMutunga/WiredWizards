<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $table = 'inventory';

    protected $fillable = [
        'product_id',
        'location_id',
        'quantity_on_hand',
        'quantity_reserved',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function getAvailableAttribute(): int
    {
        return max(0, $this->quantity_on_hand - $this->quantity_reserved);
    }
}
