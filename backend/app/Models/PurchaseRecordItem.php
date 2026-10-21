<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseRecordItem extends Model
{
    protected $fillable = [
        'purchase_record_id',
        'product_id',
        'quantity_received',
        'unit_cost',
        'total_cost',
    ];

    protected $casts = [
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    public function purchaseRecord()
    {
        return $this->belongsTo(PurchaseRecord::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
