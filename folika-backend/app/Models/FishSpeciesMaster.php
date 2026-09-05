<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FishSpeciesMaster extends Model
{
    use HasFactory;

    protected $table = 'fish_species_master';

    protected $fillable = [
        'name_bn',
        'name_en',
        'water_layer',
        'min_depth_m',
        'growth_months',
        'avg_weight_kg',
        'avg_price_per_kg',
        'feed_rate_pct',
        'disease_risk',
        'suitable_aez',
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'min_depth_m' => 'decimal:2',
            'growth_months' => 'integer',
            'avg_weight_kg' => 'decimal:2',
            'avg_price_per_kg' => 'decimal:2',
            'feed_rate_pct' => 'decimal:2',
            'suitable_aez' => 'array',
        ];
    }

    public function selections()
    {
        return $this->hasMany(FishSpeciesSelection::class, 'species_id');
    }
}
