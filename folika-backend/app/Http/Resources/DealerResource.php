<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DealerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'shop_name' => $this->shop_name,
            'shop_type' => $this->shop_type,
            'owner_name' => $this->owner_name,
            'product_name' => $this->product_name,
            'sector' => $this->sector,
            'address' => $this->address,
            'upazila_id' => $this->upazila_id,
            'upazila_name_bn' => $this->upazila?->name_bn,
            'district_name_bn' => $this->upazila?->district?->name_bn,
            'phone' => $this->phone,
            'avg_rating' => (float)$this->avg_rating,
            'review_count' => $this->review_count,
            'is_verified' => (bool)$this->is_verified,
            'reviews' => DealerReviewResource::collection($this->whenLoaded('reviews')),
        ];
    }
}
