<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'role' => $this->role,
            'farm_type' => $this->farm_type,
            'division' => $this->whenLoaded('division', fn() => [
                'id' => $this->division->id,
                'name_bn' => $this->division->name_bn,
                'name_en' => $this->division->name_en,
            ]),
            'district' => $this->whenLoaded('district', fn() => [
                'id' => $this->district->id,
                'name_bn' => $this->district->name_bn,
                'name_en' => $this->district->name_en,
            ]),
            'upazila' => $this->whenLoaded('upazila', fn() => [
                'id' => $this->upazila->id,
                'name_bn' => $this->upazila->name_bn,
                'name_en' => $this->upazila->name_en,
                'aez_code' => $this->upazila->aez_code,
            ]),
            'aez_code' => $this->aez_code,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'language' => $this->language,
            'avatar_url' => $this->avatar_url,
            'is_verified' => (bool)$this->is_verified,
            'notify_push' => (bool)$this->notify_push,
            'notify_sms' => (bool)$this->notify_sms,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
