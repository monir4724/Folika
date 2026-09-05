<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MarketPriceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_name' => $this->product_name,
            'category' => $this->category,
            'district_id' => $this->district_id,
            'district_name_bn' => $this->district?->name_bn,
            'price_per_kg' => (float)$this->price_per_kg,
            'source' => $this->source,
            'verified' => (bool)$this->verified,
            'recorded_at' => $this->recorded_at?->format('Y-m-d'),
        ];
    }
}
