<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LivestockBreedResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'animal_type' => $this->animal_type,
            'breed_name' => $this->breed_name,
            'purpose' => $this->purpose,
            'origin' => $this->origin,
            'description' => $this->description,
            'image_url' => $this->image_url,
        ];
    }
}
