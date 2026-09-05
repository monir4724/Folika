<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FishSpeciesResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_bn' => $this->name_bn,
            'name_en' => $this->name_en,
            'water_layer' => $this->water_layer,
            'min_depth_m' => (float)$this->min_depth_m,
            'growth_months' => $this->growth_months,
            'avg_weight_kg' => (float)$this->avg_weight_kg,
            'avg_price_per_kg' => (float)$this->avg_price_per_kg,
            'feed_rate_pct' => (float)$this->feed_rate_pct,
            'disease_risk' => $this->disease_risk,
            'suitable_aez' => $this->suitable_aez,
            'image_url' => $this->image_url,
        ];
    }
}
