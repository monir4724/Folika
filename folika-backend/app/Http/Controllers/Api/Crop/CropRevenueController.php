<?php

namespace App\Http\Controllers\Api\Crop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Crop\StoreRevenueItemRequest;
use App\Http\Resources\CropRevenueItemResource;
use App\Models\CropPlan;
use App\Models\CropRevenueItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CropRevenueController extends Controller
{
    /**
     * List revenue items for a crop plan
     */
    public function index(int $planId, Request $request): JsonResponse
    {
        $plan = CropPlan::where('id', $planId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $items = $plan->revenueItems;

        return response()->json([
            'success' => true,
            'data' => CropRevenueItemResource::collection($items),
        ]);
    }

    /**
     * Store revenue item and recalculate plan total revenue
     */
    public function store(int $planId, StoreRevenueItemRequest $request): JsonResponse
    {
        $plan = CropPlan::where('id', $planId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validated();
        $validated['crop_plan_id'] = $plan->id;
        $validated['total_price'] = round($validated['quantity'] * $validated['unit_price'], 2);

        $item = CropRevenueItem::create($validated);

        // Recalculate plan total revenue
        $totalRev = CropRevenueItem::where('crop_plan_id', $plan->id)->sum('total_price');
        $plan->update(['total_revenue' => $totalRev]);

        return response()->json([
            'success' => true,
            'message' => 'Revenue item recorded successfully.',
            'data' => new CropRevenueItemResource($item),
        ], 201);
    }

    /**
     * Delete revenue item
     */
    public function destroy(int $planId, int $itemId, Request $request): JsonResponse
    {
        $plan = CropPlan::where('id', $planId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $item = CropRevenueItem::where('id', $itemId)
            ->where('crop_plan_id', $plan->id)
            ->firstOrFail();

        $item->delete();

        $totalRev = CropRevenueItem::where('crop_plan_id', $plan->id)->sum('total_price');
        $plan->update(['total_revenue' => $totalRev]);

        return response()->json([
            'success' => true,
            'message' => 'Revenue item removed.',
            'new_total_revenue' => (float)$totalRev,
        ]);
    }
}
