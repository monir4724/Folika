<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FishPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'pond_length_m' => (float)$this->pond_length_m,
            'pond_width_m' => (float)$this->pond_width_m,
            'pond_depth_m' => (float)$this->pond_depth_m,
            'pond_area_sqm' => (float)$this->pond_area_sqm,
            'pond_volume_m3' => (float)$this->pond_volume_m3,
            'location_desc' => $this->location_desc,
            'culture_duration_months' => $this->culture_duration_months,
            'lime_kg' => (float)$this->lime_kg,
            'organic_fertilizer_kg' => (float)$this->organic_fertilizer_kg,
            'probiotic_used' => (bool)$this->probiotic_used,
            'oxygen_checked' => (bool)$this->oxygen_checked,
            'nearest_supplier' => $this->nearest_supplier,
            'status' => $this->status,
            'total_cost' => (float)$this->total_cost,
            'total_revenue' => (float)$this->total_revenue,
            'net_profit' => (float)$this->net_profit,
            'species_selections' => $this->speciesSelections?->map(function ($selection) {
                return [
                    'id' => $selection->id,
                    'species_id' => $selection->species_id,
                    'species_name_bn' => $selection->species?->name_bn,
                    'species_name_en' => $selection->species?->name_en,
                    'water_layer' => $selection->water_layer,
                    'quantity' => $selection->quantity,
                    'stocking_density_per_sqm' => (float)$selection->stocking_density_per_sqm,
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
