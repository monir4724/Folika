<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ForumReplyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'body' => $this->body,
            'is_expert' => (bool)$this->is_expert,
            'upvotes' => $this->upvotes,
            'status' => $this->status,
            'author' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'role' => $this->user?->role,
                'avatar_url' => $this->user?->avatar_url,
            ],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
