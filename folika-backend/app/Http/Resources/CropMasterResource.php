<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CropMasterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_bn' => $this->name_bn,
            'name_en' => $this->name_en,
            'category' => $this->category,
            'suitable_aez' => $this->suitable_aez,
            'suitable_seasons' => $this->suitable_seasons,
            'avg_yield_per_bigha' => (float)$this->avg_yield_per_bigha,
            'avg_price_per_kg' => (float)$this->avg_price_per_kg,
            'image_url' => $this->image_url,
        ];
    }
}
