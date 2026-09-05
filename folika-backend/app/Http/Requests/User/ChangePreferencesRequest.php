<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class ChangePreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'language' => ['nullable', 'in:bn,en'],
            'notify_push' => ['nullable', 'boolean'],
            'notify_sms' => ['nullable', 'boolean'],
            'fcm_token' => ['nullable', 'string'],
        ];
    }
}
