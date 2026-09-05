<?php

namespace App\Http\Controllers\Api\Livestock;

use App\Http\Controllers\Controller;
use App\Http\Requests\Livestock\StoreVaccineScheduleRequest;
use App\Http\Resources\VaccineScheduleResource;
use App\Models\LivestockPlan;
use App\Models\VaccineSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VaccineScheduleController extends Controller
{
    /**
     * List vaccine schedules for a livestock plan
     */
    public function index(int $planId, Request $request): JsonResponse
    {
        $plan = LivestockPlan::where('id', $planId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $schedules = $plan->vaccineSchedules()->orderBy('due_date')->get();

        return response()->json([
            'success' => true,
            'data' => VaccineScheduleResource::collection($schedules),
        ]);
    }

    /**
     * Add custom vaccine schedule
     */
    public function store(int $planId, StoreVaccineScheduleRequest $request): JsonResponse
    {
        $plan = LivestockPlan::where('id', $planId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validated();
        $validated['livestock_plan_id'] = $plan->id;

        $schedule = VaccineSchedule::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vaccine schedule added.',
            'data' => new VaccineScheduleResource($schedule),
        ], 201);
    }

    /**
     * Mark vaccine as completed
     */
    public function markCompleted(int $planId, int $vaccineId, Request $request): JsonResponse
    {
        $plan = LivestockPlan::where('id', $planId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $vaccine = VaccineSchedule::where('id', $vaccineId)
            ->where('livestock_plan_id', $plan->id)
            ->firstOrFail();

        $vaccine->update(['completed_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Vaccine marked as completed.',
            'data' => new VaccineScheduleResource($vaccine),
        ]);
    }
}
