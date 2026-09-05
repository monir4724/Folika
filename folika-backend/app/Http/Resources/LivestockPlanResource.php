<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LivestockPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'shed_shape' => $this->shed_shape,
            'shed_length_m' => (float)$this->shed_length_m,
            'shed_width_m' => (float)$this->shed_width_m,
            'shed_area_sqm' => (float)$this->shed_area_sqm,
            'animal_type' => $this->animal_type,
            'breed' => new LivestockBreedResource($this->whenLoaded('breed')),
            'purpose' => $this->purpose,
            'animal_count' => $this->animal_count,
            'max_capacity' => $this->max_capacity,
            'rearing_months' => $this->rearing_months,
            'housing_type' => $this->housing_type,
            'floor_type' => $this->floor_type,
            'ventilation_type' => $this->ventilation_type,
            'water_supply_type' => $this->water_supply_type,
            'feed_type' => $this->feed_type,
            'daily_feed_kg' => (float)$this->daily_feed_kg,
            'daily_water_l' => (float)$this->daily_water_l,
            'supplement_used' => $this->supplement_used,
            'status' => $this->status,
            'total_cost' => (float)$this->total_cost,
            'total_revenue' => (float)$this->total_revenue,
            'net_profit' => (float)$this->net_profit,
            'vaccine_schedules' => VaccineScheduleResource::collection($this->whenLoaded('vaccineSchedules')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
