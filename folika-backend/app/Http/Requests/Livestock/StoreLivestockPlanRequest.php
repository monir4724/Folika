<?php

namespace App\Http\Requests\Livestock;

use Illuminate\Foundation\Http\FormRequest;

class StoreLivestockPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'shed_shape' => ['nullable', 'in:rectangular,L_shape,other'],
            'shed_length_m' => ['nullable', 'numeric', 'min:0'],
            'shed_width_m' => ['nullable', 'numeric', 'min:0'],
            'shed_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'animal_type' => ['required', 'in:cow,buffalo,goat,sheep,chicken,duck,other'],
            'breed_id' => ['nullable', 'exists:livestock_breeds_master,id'],
            'purpose' => ['nullable', 'in:meat,milk,egg,dual'],
            'animal_count' => ['required', 'integer', 'min:1'],
            'max_capacity' => ['nullable', 'integer', 'min:1'],
            'rearing_months' => ['nullable', 'integer', 'min:1'],
            'housing_type' => ['nullable', 'string'],
            'floor_type' => ['nullable', 'string'],
            'ventilation_type' => ['nullable', 'string'],
            'water_supply_type' => ['nullable', 'string'],
            'feed_type' => ['nullable', 'string'],
            'daily_feed_kg' => ['nullable', 'numeric', 'min:0'],
            'daily_water_l' => ['nullable', 'numeric', 'min:0'],
            'supplement_used' => ['nullable', 'string'],
            'status' => ['nullable', 'in:draft,active,completed,cancelled'],
        ];
    }
}
