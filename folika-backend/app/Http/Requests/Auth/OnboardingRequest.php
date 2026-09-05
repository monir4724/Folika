<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class OnboardingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'division_id' => ['required', 'exists:divisions,id'],
            'district_id' => ['required', 'exists:districts,id'],
            'upazila_id' => ['required', 'exists:upazilas,id'],
            'farm_type' => ['nullable', 'in:crop,fish,livestock,mixed'],
            'language' => ['nullable', 'in:bn,en'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'fcm_token' => ['nullable', 'string'],
        ];
    }
}
