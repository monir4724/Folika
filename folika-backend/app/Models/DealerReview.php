<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DealerReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'dealer_id',
        'user_id',
        'rating',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    public function dealer()
    {
        return $this->belongsTo(Dealer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
