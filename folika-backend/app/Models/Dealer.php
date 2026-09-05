<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dealer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shop_name',
        'shop_type',
        'owner_name',
        'product_name',
        'sector',
        'address',
        'upazila_id',
        'phone',
        'avg_rating',
        'review_count',
        'is_verified',
    ];

    protected function casts(): array
    {
        return [
            'avg_rating' => 'decimal:2',
            'review_count' => 'integer',
            'is_verified' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function upazila()
    {
        return $this->belongsTo(Upazila::class);
    }

    public function reviews()
    {
        return $this->hasMany(DealerReview::class);
    }
}
