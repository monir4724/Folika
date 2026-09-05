<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'category',
        'district_id',
        'price_per_kg',
        'source',
        'submitted_by',
        'verified',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'price_per_kg' => 'decimal:2',
            'verified' => 'boolean',
            'recorded_at' => 'date',
        ];
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
