<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'mobile',
        'otp_hash',
        'purpose',
        'attempts',
        'max_attempts',
        'expires_at',
        'used_at',
        'ip_address',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
            'created_at' => 'datetime',
            'attempts' => 'integer',
            'max_attempts' => 'integer',
        ];
    }
}
