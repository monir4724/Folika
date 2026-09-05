<?php

namespace App\Http\Requests\Livestock;

use Illuminate\Foundation\Http\FormRequest;

class StoreVaccineScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vaccine_name' => ['required', 'string', 'max:150'],
            'vaccine_name_bn' => ['required', 'string', 'max:150'],
            'frequency' => ['nullable', 'string'],
            'due_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
