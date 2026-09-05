<?php

namespace App\Http\Controllers\Api\Market;

use App\Http\Controllers\Controller;
use App\Http\Resources\MarketPriceResource;
use App\Models\MarketPrice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarketPriceController extends Controller
{
    /**
     * Get market prices filtered by category and district
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $districtId = $request->input('district_id', $user?->district_id ?? 1);
        $category = $request->input('category');

        $query = MarketPrice::with('district')
            ->where('district_id', $districtId);

        if ($category && in_array($category, ['crop', 'fish', 'livestock', 'input'])) {
            $query->where('category', $category);
        }

        $prices = $query->latest('recorded_at')->get();

        return response()->json([
            'success' => true,
            'data' => MarketPriceResource::collection($prices),
        ]);
    }

    /**
     * Submit community market price
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:150',
            'category' => 'required|in:crop,fish,livestock,input',
            'district_id' => 'required|exists:districts,id',
            'price_per_kg' => 'required|numeric|min:0.01',
        ]);

        $validated['submitted_by'] = $request->user()->id;
        $validated['source'] = 'community';
        $validated['verified'] = false;
        $validated['recorded_at'] = now();

        $price = MarketPrice::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Market price reported for verification.',
            'data' => new MarketPriceResource($price),
        ], 201);
    }
}
