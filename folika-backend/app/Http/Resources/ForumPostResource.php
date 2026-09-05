<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ForumPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category,
            'title' => $this->title,
            'body' => $this->body,
            'is_official' => (bool)$this->is_official,
            'is_pinned' => (bool)$this->is_pinned,
            'upvotes' => $this->upvotes,
            'downvotes' => $this->downvotes,
            'reply_count' => $this->reply_count,
            'status' => $this->status,
            'author' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'role' => $this->user?->role,
                'avatar_url' => $this->user?->avatar_url,
            ],
            'replies' => ForumReplyResource::collection($this->whenLoaded('replies')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
