<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CropRevenueItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_name' => $this->item_name,
            'quantity' => (float)$this->quantity,
            'unit' => $this->unit,
            'unit_price' => (float)$this->unit_price,
            'total_price' => (float)$this->total_price,
        ];
    }
}
