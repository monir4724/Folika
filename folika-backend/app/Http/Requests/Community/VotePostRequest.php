<?php

namespace App\Http\Requests\Community;

use Illuminate\Foundation\Http\FormRequest;

class VotePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vote_type' => ['required', 'in:up,down'],
        ];
    }
}
