<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'unique:users,email,' . $this->user()?->id],
            'farm_type' => ['nullable', 'in:crop,fish,livestock,mixed'],
            'division_id' => ['nullable', 'exists:divisions,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'upazila_id' => ['nullable', 'exists:upazilas,id'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'language' => ['nullable', 'in:bn,en'],
            'avatar_url' => ['nullable', 'string'],
        ];
    }
}
