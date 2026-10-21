<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseRecord extends Model
{
    protected $fillable = [
        'purchase_reference',
        'supplier_id',
        'location_id',
        'total_cost',
        'supplier_invoice_ref',
        'received_by',
        'notes',
    ];

    protected $casts = [
        'total_cost' => 'decimal:2',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function items()
    {
        return $this->hasMany(PurchaseRecordItem::class);
    }
}
