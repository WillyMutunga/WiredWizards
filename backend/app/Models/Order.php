<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'customer_id',
        'sales_agent_id',
        'location_id',
        'order_status',
        'payment_status',
        'payment_method',
        'subtotal',
        'discount_amount',
        'vat_amount',
        'delivery_fee',
        'total_amount',
        'amount_paid',
        'delivery_address',
        'cancellation_reason',
        'cancelled_by',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'delivery_address' => 'array',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function salesAgent()
    {
        return $this->belongsTo(User::class, 'sales_agent_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(PaymentReceipt::class);
    }
}
