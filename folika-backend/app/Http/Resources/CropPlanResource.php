<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CropPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'land_shape' => $this->land_shape,
            'land_length_m' => (float)$this->land_length_m,
            'land_width_m' => (float)$this->land_width_m,
            'land_area_sqm' => (float)$this->land_area_sqm,
            'land_area_bigha' => (float)$this->land_area_bigha,
            'land_area_shatok' => (float)$this->land_area_shatok,
            'crop' => new CropMasterResource($this->whenLoaded('crop')),
            'previous_crop' => new CropMasterResource($this->whenLoaded('previousCrop')),
            'season' => $this->season,
            'soil_type' => $this->soil_type,
            'tillage_method' => $this->tillage_method,
            'organic_fertilizer' => $this->organic_fertilizer,
            'chemical_fertilizer' => $this->chemical_fertilizer,
            'sowing_method' => $this->sowing_method,
            'row_spacing_cm' => (float)$this->row_spacing_cm,
            'plant_spacing_cm' => (float)$this->plant_spacing_cm,
            'sowing_depth_cm' => (float)$this->sowing_depth_cm,
            'sowing_date' => $this->sowing_date?->format('Y-m-d'),
            'expected_harvest_date' => $this->expected_harvest_date?->format('Y-m-d'),
            'irrigation_notes' => $this->irrigation_notes,
            'ai_rotation_note' => $this->ai_rotation_note,
            'weather_cache' => $this->weather_cache,
            'status' => $this->status,
            'total_cost' => (float)$this->total_cost,
            'total_revenue' => (float)$this->total_revenue,
            'net_profit' => (float)$this->net_profit,
            'cost_items' => CropCostItemResource::collection($this->whenLoaded('costItems')),
            'revenue_items' => CropRevenueItemResource::collection($this->whenLoaded('revenueItems')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
