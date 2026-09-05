<?php

namespace App\Http\Requests\Fish;

use Illuminate\Foundation\Http\FormRequest;

class StoreSpeciesSelectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'species_id' => ['required', 'exists:fish_species_master,id'],
            'water_layer' => ['required', 'in:surface,middle,bottom'],
            'quantity' => ['required', 'integer', 'min:1'],
            'stocking_density_per_sqm' => ['nullable', 'numeric'],
        ];
    }
}
