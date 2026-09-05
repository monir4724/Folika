<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CropsMaster extends Model
{
    use HasFactory;

    protected $table = 'crops_master';

    protected $fillable = [
        'name_bn',
        'name_en',
        'category',
        'suitable_aez',
        'suitable_seasons',
        'avg_yield_per_bigha',
        'avg_price_per_kg',
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'suitable_aez' => 'array',
            'suitable_seasons' => 'array',
            'avg_yield_per_bigha' => 'decimal:2',
            'avg_price_per_kg' => 'decimal:2',
        ];
    }

    public function plans()
    {
        return $this->hasMany(CropPlan::class, 'crop_id');
    }
}
