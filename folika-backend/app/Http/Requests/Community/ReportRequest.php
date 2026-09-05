<?php

namespace App\Http\Requests\Community;

use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_type' => ['required', 'in:post,reply'],
            'target_id' => ['required', 'integer'],
            'reason' => ['required', 'in:spam,misinformation,abusive,other'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
