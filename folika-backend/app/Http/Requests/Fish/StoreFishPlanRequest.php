<?php

namespace App\Http\Requests\Fish;

use Illuminate\Foundation\Http\FormRequest;

class StoreFishPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'pond_length_m' => ['nullable', 'numeric', 'min:0'],
            'pond_width_m' => ['nullable', 'numeric', 'min:0'],
            'pond_depth_m' => ['nullable', 'numeric', 'min:0'],
            'pond_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'pond_volume_m3' => ['nullable', 'numeric', 'min:0'],
            'location_desc' => ['nullable', 'string'],
            'culture_duration_months' => ['nullable', 'integer', 'min:1', 'max:36'],
            'lime_kg' => ['nullable', 'numeric', 'min:0'],
            'organic_fertilizer_kg' => ['nullable', 'numeric', 'min:0'],
            'probiotic_used' => ['nullable', 'boolean'],
            'oxygen_checked' => ['nullable', 'boolean'],
            'nearest_supplier' => ['nullable', 'string'],
            'status' => ['nullable', 'in:draft,active,harvested,cancelled'],
            'species' => ['nullable', 'array'],
            'species.*.species_id' => ['required_with:species', 'exists:fish_species_master,id'],
            'species.*.water_layer' => ['required_with:species', 'in:surface,middle,bottom'],
            'species.*.quantity' => ['required_with:species', 'integer', 'min:1'],
        ];
    }
}
