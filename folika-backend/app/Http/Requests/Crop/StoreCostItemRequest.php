<?php

namespace App\Http\Requests\Crop;

use Illuminate\Foundation\Http\FormRequest;

class StoreCostItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_type' => ['required', 'in:input,labor,irrigation,transport,other'],
            'item_name' => ['required', 'string', 'max:150'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit' => ['required', 'string', 'max:50'],
            'unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
