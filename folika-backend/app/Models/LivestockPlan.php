<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LivestockPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'shed_shape',
        'shed_length_m',
        'shed_width_m',
        'shed_area_sqm',
        'animal_type',
        'breed_id',
        'purpose',
        'animal_count',
        'max_capacity',
        'rearing_months',
        'housing_type',
        'floor_type',
        'ventilation_type',
        'water_supply_type',
        'feed_type',
        'daily_feed_kg',
        'daily_water_l',
        'supplement_used',
        'status',
        'total_cost',
        'total_revenue',
    ];

    protected function casts(): array
    {
        return [
            'shed_length_m' => 'decimal:2',
            'shed_width_m' => 'decimal:2',
            'shed_area_sqm' => 'decimal:2',
            'animal_count' => 'integer',
            'max_capacity' => 'integer',
            'rearing_months' => 'integer',
            'daily_feed_kg' => 'decimal:2',
            'daily_water_l' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'total_revenue' => 'decimal:2',
            'net_profit' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function breed()
    {
        return $this->belongsTo(LivestockBreedsMaster::class, 'breed_id');
    }

    public function vaccineSchedules()
    {
        return $this->hasMany(VaccineSchedule::class);
    }
}
