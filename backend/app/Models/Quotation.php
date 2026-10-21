<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quotation extends Model
{
    protected $fillable = [
        'quotation_number',
        'customer_id',
        'sales_agent_id',
        'status',
        'subtotal',
        'discount_amount',
        'vat_amount',
        'delivery_fee',
        'grand_total',
        'valid_until',
        'terms_and_conditions',
        'pdf_path',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'valid_until' => 'date',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function salesAgent()
    {
        return $this->belongsTo(User::class, 'sales_agent_id');
    }

    public function items()
    {
        return $this->hasMany(QuotationItem::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }
}
