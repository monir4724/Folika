<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VaccineScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vaccine_name' => $this->vaccine_name,
            'vaccine_name_bn' => $this->vaccine_name_bn,
            'frequency' => $this->frequency,
            'due_date' => $this->due_date?->format('Y-m-d'),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'is_completed' => !empty($this->completed_at),
            'reminder_sent' => (bool)$this->reminder_sent,
            'notes' => $this->notes,
        ];
    }
}
