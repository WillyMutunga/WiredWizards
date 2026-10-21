<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'kra_pin',
        'customer_type',
        'loyalty_points',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
