<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ForumPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category',
        'title',
        'body',
        'is_official',
        'is_pinned',
        'upvotes',
        'downvotes',
        'reply_count',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_official' => 'boolean',
            'is_pinned' => 'boolean',
            'upvotes' => 'integer',
            'downvotes' => 'integer',
            'reply_count' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(ForumReply::class, 'post_id');
    }

    public function votes()
    {
        return $this->hasMany(PostVote::class, 'post_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'target_id')->where('target_type', 'post');
    }
}
