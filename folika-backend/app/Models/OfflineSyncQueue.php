<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfflineSyncQueue extends Model
{
    use HasFactory;

    protected $table = 'offline_sync_queue';

    protected $fillable = [
        'user_id',
        'action_type',
        'payload_json',
        'status',
        'retry_count',
        'synced_at',
    ];

    protected function casts(): array
    {
        return [
            'payload_json' => 'array',
            'retry_count' => 'integer',
            'synced_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
