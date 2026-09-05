<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationQueue extends Model
{
    use HasFactory;

    protected $table = 'notification_queue';

    protected $fillable = [
        'user_id',
        'type',
        'channel',
        'title',
        'body',
        'data_json',
        'fcm_token',
        'mobile',
        'status',
        'scheduled_at',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'data_json' => 'array',
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
