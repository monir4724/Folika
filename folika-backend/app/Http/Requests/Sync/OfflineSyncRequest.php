<?php

namespace App\Http\Requests\Sync;

use Illuminate\Foundation\Http\FormRequest;

class OfflineSyncRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'queue' => ['required', 'array'],
            'queue.*.action_type' => ['required', 'in:create_crop_plan,create_fish_plan,create_livestock_plan,create_post,create_reply,disease_detection'],
            'queue.*.payload' => ['required', 'array'],
        ];
    }
}
