<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LivestockBreedsMaster extends Model
{
    use HasFactory;

    protected $table = 'livestock_breeds_master';

    protected $fillable = [
        'animal_type',
        'breed_name',
        'purpose',
        'origin',
        'description',
        'image_url',
    ];

    public function plans()
    {
        return $this->hasMany(LivestockPlan::class, 'breed_id');
    }
}
