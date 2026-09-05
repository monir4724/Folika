<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CropPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'land_shape',
        'land_length_m',
        'land_width_m',
        'land_area_sqm',
        'land_area_bigha',
        'land_area_shatok',
        'crop_id',
        'season',
        'previous_crop_id',
        'soil_type',
        'tillage_method',
        'organic_fertilizer',
        'chemical_fertilizer',
        'sowing_method',
        'row_spacing_cm',
        'plant_spacing_cm',
        'sowing_depth_cm',
        'sowing_date',
        'expected_harvest_date',
        'irrigation_notes',
        'ai_rotation_note',
        'weather_cache',
        'status',
        'total_cost',
        'total_revenue',
    ];

    protected function casts(): array
    {
        return [
            'land_length_m' => 'decimal:2',
            'land_width_m' => 'decimal:2',
            'land_area_sqm' => 'decimal:2',
            'land_area_bigha' => 'decimal:2',
            'land_area_shatok' => 'decimal:2',
            'row_spacing_cm' => 'decimal:2',
            'plant_spacing_cm' => 'decimal:2',
            'sowing_depth_cm' => 'decimal:2',
            'sowing_date' => 'date',
            'expected_harvest_date' => 'date',
            'weather_cache' => 'array',
            'total_cost' => 'decimal:2',
            'total_revenue' => 'decimal:2',
            'net_profit' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function crop()
    {
        return $this->belongsTo(CropsMaster::class, 'crop_id');
    }

    public function previousCrop()
    {
        return $this->belongsTo(CropsMaster::class, 'previous_crop_id');
    }

    public function costItems()
    {
        return $this->hasMany(CropCostItem::class);
    }

    public function revenueItems()
    {
        return $this->hasMany(CropRevenueItem::class);
    }
}
