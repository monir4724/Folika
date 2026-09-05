<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'channel' => $this->channel,
            'title' => $this->title,
            'body' => $this->body,
            'data' => $this->data_json,
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'sent_at' => $this->sent_at?->toIso8601String(),
            'is_read' => $this->status === 'sent',
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
