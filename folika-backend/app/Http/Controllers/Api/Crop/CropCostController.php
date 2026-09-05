<?php

namespace App\Http\Controllers\Api\Crop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Crop\StoreCostItemRequest;
use App\Http\Resources\CropCostItemResource;
use App\Models\CropCostItem;
use App\Models\CropPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CropCostController extends Controller
{
    /**
     * List cost items for a crop plan
     */
    public function index(int $planId, Request $request): JsonResponse
    {
        $plan = CropPlan::where('id', $planId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $items = $plan->costItems;

        return response()->json([
            'success' => true,
            'data' => CropCostItemResource::collection($items),
        ]);
    }

    /**
     * Store cost item and recalculate plan total cost
     */
    public function store(int $planId, StoreCostItemRequest $request): JsonResponse
    {
        $plan = CropPlan::where('id', $planId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validated();
        $validated['crop_plan_id'] = $plan->id;
        $validated['total_price'] = round($validated['quantity'] * $validated['unit_price'], 2);

        $item = CropCostItem::create($validated);

        // Recalculate plan total cost
        $totalCost = CropCostItem::where('crop_plan_id', $plan->id)->sum('total_price');
        $plan->update(['total_cost' => $totalCost]);

        return response()->json([
            'success' => true,
            'message' => 'Cost item added successfully.',
            'data' => new CropCostItemResource($item),
        ], 201);
    }

    /**
     * Delete cost item and update total cost
     */
    public function destroy(int $planId, int $itemId, Request $request): JsonResponse
    {
        $plan = CropPlan::where('id', $planId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $item = CropCostItem::where('id', $itemId)
            ->where('crop_plan_id', $plan->id)
            ->firstOrFail();

        $item->delete();

        $totalCost = CropCostItem::where('crop_plan_id', $plan->id)->sum('total_price');
        $plan->update(['total_cost' => $totalCost]);

        return response()->json([
            'success' => true,
            'message' => 'Cost item removed.',
            'new_total_cost' => (float)$totalCost,
        ]);
    }
}
