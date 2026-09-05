<?php

namespace App\Http\Requests\Crop;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCropPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:150'],
            'land_shape' => ['nullable', 'in:rectangular,triangular,irregular'],
            'land_length_m' => ['nullable', 'numeric', 'min:0'],
            'land_width_m' => ['nullable', 'numeric', 'min:0'],
            'land_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'land_area_bigha' => ['nullable', 'numeric', 'min:0'],
            'land_area_shatok' => ['nullable', 'numeric', 'min:0'],
            'crop_id' => ['nullable', 'exists:crops_master,id'],
            'season' => ['nullable', 'in:rabi,kharif_1,kharif_2,year_round'],
            'previous_crop_id' => ['nullable', 'exists:crops_master,id'],
            'soil_type' => ['nullable', 'string'],
            'tillage_method' => ['nullable', 'string'],
            'organic_fertilizer' => ['nullable', 'string'],
            'chemical_fertilizer' => ['nullable', 'string'],
            'sowing_method' => ['nullable', 'string'],
            'row_spacing_cm' => ['nullable', 'numeric'],
            'plant_spacing_cm' => ['nullable', 'numeric'],
            'sowing_depth_cm' => ['nullable', 'numeric'],
            'sowing_date' => ['nullable', 'date'],
            'expected_harvest_date' => ['nullable', 'date'],
            'irrigation_notes' => ['nullable', 'string'],
            'status' => ['nullable', 'in:draft,active,harvested,cancelled'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
            'total_revenue' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
