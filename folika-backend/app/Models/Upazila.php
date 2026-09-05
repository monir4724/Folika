<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Upazila extends Model
{
    use HasFactory;

    protected $fillable = ['district_id', 'name_bn', 'name_en', 'aez_code'];

    protected function casts(): array
    {
        return [
            'aez_code' => 'integer',
        ];
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function dealers()
    {
        return $this->hasMany(Dealer::class);
    }
}
