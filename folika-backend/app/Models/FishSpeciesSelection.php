<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FishSpeciesSelection extends Model
{
    use HasFactory;

    protected $fillable = [
        'fish_plan_id',
        'species_id',
        'water_layer',
        'quantity',
        'stocking_density_per_sqm',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'stocking_density_per_sqm' => 'decimal:2',
        ];
    }

    public function fishPlan()
    {
        return $this->belongsTo(FishPlan::class);
    }

    public function species()
    {
        return $this->belongsTo(FishSpeciesMaster::class, 'species_id');
    }
}
