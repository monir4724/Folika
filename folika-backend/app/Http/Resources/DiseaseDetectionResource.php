<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiseaseDetectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category,
            'image_url' => $this->image_url,
            'image_size_kb' => $this->image_size_kb,
            'symptoms' => $this->symptoms_json,
            'disease_name' => $this->disease_name,
            'confidence_pct' => (float)$this->confidence_pct,
            'severity' => $this->severity,
            'treatment_notes' => $this->treatment_notes,
            'ai_result' => $this->ai_result_json,
            'status' => $this->status,
            'analyzed_at' => $this->analyzed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
