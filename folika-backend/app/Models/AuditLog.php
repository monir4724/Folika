<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'actor_type',
        'actor_id',
        'action',
        'target_type',
        'target_id',
        'details_json',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'details_json' => 'array',
        ];
    }
}
