<?php

namespace App\Http\Requests\Disease;

use Illuminate\Foundation\Http\FormRequest;

class AnalyzeDiseaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['required', 'in:crop,fish,livestock'],
            'image' => ['nullable', 'image', 'max:10240'], // 10MB max
            'image_url' => ['nullable', 'string'],
            'symptoms' => ['nullable', 'array'],
        ];
    }
}
