<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = [
        'name',
        'code',
        'location_type',
        'county',
        'town',
        'address',
        'phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function inventory()
    {
        return $this->hasMany(Inventory::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
