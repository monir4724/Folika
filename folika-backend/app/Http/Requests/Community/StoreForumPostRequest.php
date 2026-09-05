<?php

namespace App\Http\Requests\Community;

use Illuminate\Foundation\Http\FormRequest;

class StoreForumPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['required', 'in:crop,fish,livestock,market,general,official_notice'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'is_pinned' => ['nullable', 'boolean'],
        ];
    }
}
