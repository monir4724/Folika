<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FishPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'pond_length_m',
        'pond_width_m',
        'pond_depth_m',
        'pond_area_sqm',
        'pond_volume_m3',
        'location_desc',
        'culture_duration_months',
        'lime_kg',
        'organic_fertilizer_kg',
        'probiotic_used',
        'oxygen_checked',
        'nearest_supplier',
        'status',
        'total_cost',
        'total_revenue',
    ];

    protected function casts(): array
    {
        return [
            'pond_length_m' => 'decimal:2',
            'pond_width_m' => 'decimal:2',
            'pond_depth_m' => 'decimal:2',
            'pond_area_sqm' => 'decimal:2',
            'pond_volume_m3' => 'decimal:2',
            'culture_duration_months' => 'integer',
            'lime_kg' => 'decimal:2',
            'organic_fertilizer_kg' => 'decimal:2',
            'probiotic_used' => 'boolean',
            'oxygen_checked' => 'boolean',
            'total_cost' => 'decimal:2',
            'total_revenue' => 'decimal:2',
            'net_profit' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function speciesSelections()
    {
        return $this->hasMany(FishSpeciesSelection::class);
    }
}
