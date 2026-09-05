<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CropRevenueItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'crop_plan_id',
        'item_name',
        'quantity',
        'unit',
        'unit_price',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    public function cropPlan()
    {
        return $this->belongsTo(CropPlan::class);
    }
}
