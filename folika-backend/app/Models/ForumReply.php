<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ForumReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_id',
        'body',
        'is_expert',
        'upvotes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_expert' => 'boolean',
            'upvotes' => 'integer',
        ];
    }

    public function post()
    {
        return $this->belongsTo(ForumPost::class, 'post_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
