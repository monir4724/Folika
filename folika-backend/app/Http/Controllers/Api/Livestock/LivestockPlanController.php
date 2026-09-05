<?php

namespace App\Http\Controllers\Api\Livestock;

use App\Http\Controllers\Controller;
use App\Http\Requests\Livestock\StoreLivestockPlanRequest;
use App\Http\Resources\LivestockBreedResource;
use App\Http\Resources\LivestockPlanResource;
use App\Models\LivestockBreedsMaster;
use App\Models\LivestockPlan;
use App\Models\VaccineSchedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LivestockPlanController extends Controller
{
    /**
     * List user's livestock plans
     */
    public function index(Request $request): JsonResponse
    {
        $plans = LivestockPlan::where('user_id', $request->user()->id)
            ->with(['breed', 'vaccineSchedules'])
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => LivestockPlanResource::collection($plans),
        ]);
    }

    /**
     * Store new livestock plan
     */
    public function store(StoreLivestockPlanRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $validated['user_id'] = $user->id;

        // Auto-calculate shed dimensions & capacity if provided
        if (isset($validated['shed_length_m'], $validated['shed_width_m'])) {
            $sqm = (float)$validated['shed_length_m'] * (float)$validated['shed_width_m'];
            $validated['shed_area_sqm'] = $sqm;

            $capacity = $this->calculateMaxCapacity($validated['animal_type'], $sqm);
            $validated['max_capacity'] = $capacity;
        }

        // Auto-calculate standard feed & water requirement
        if (!isset($validated['daily_feed_kg']) || $validated['daily_feed_kg'] == 0) {
            $validated['daily_feed_kg'] = $this->calculateDailyFeed($validated['animal_type'], $validated['animal_count']);
        }
        if (!isset($validated['daily_water_l']) || $validated['daily_water_l'] == 0) {
            $validated['daily_water_l'] = $this->calculateDailyWater($validated['animal_type'], $validated['animal_count']);
        }

        $plan = LivestockPlan::create($validated);

        // Auto-generate initial vaccine schedule
        $this->createInitialVaccines($plan);

        $plan->load(['breed', 'vaccineSchedules']);

        return response()->json([
            'success' => true,
            'message' => 'Livestock plan created successfully with vaccine schedule.',
            'data' => new LivestockPlanResource($plan),
        ], 201);
    }

    /**
     * Show single livestock plan
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $plan = LivestockPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with(['breed', 'vaccineSchedules'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new LivestockPlanResource($plan),
        ]);
    }

    /**
     * Update livestock plan
     */
    public function update(int $id, Request $request): JsonResponse
    {
        $plan = LivestockPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $plan->update($request->all());
        $plan->load(['breed', 'vaccineSchedules']);

        return response()->json([
            'success' => true,
            'message' => 'Livestock plan updated successfully.',
            'data' => new LivestockPlanResource($plan),
        ]);
    }

    /**
     * Soft delete livestock plan
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $plan = LivestockPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Livestock plan deleted successfully.',
        ]);
    }

    /**
     * Get all master livestock breeds
     */
    public function breeds(Request $request): JsonResponse
    {
        $type = $request->input('animal_type');
        $query = LivestockBreedsMaster::query();

        if ($type) {
            $query->where('animal_type', $type);
        }

        return response()->json([
            'success' => true,
            'data' => LivestockBreedResource::collection($query->get()),
        ]);
    }

    /**
     * Check shed capacity and density
     */
    public function capacityCheck(Request $request): JsonResponse
    {
        $request->validate([
            'animal_type' => 'required|in:cow,buffalo,goat,sheep,chicken,duck,other',
            'shed_area_sqm' => 'required|numeric|min:1',
            'animal_count' => 'required|integer|min:1',
        ]);

        $animalType = $request->input('animal_type');
        $area = (float)$request->input('shed_area_sqm');
        $count = (int)$request->input('animal_count');

        $maxCapacity = $this->calculateMaxCapacity($animalType, $area);
        $isOvercrowded = $count > $maxCapacity;

        return response()->json([
            'success' => true,
            'data' => [
                'shed_area_sqm' => $area,
                'animal_count' => $count,
                'max_recommended_capacity' => $maxCapacity,
                'is_overcrowded' => $isOvercrowded,
                'recommendation_bn' => $isOvercrowded 
                    ? "আপনার শেডের ধারণক্ষমতা ({$maxCapacity} টি)। অতিরিক্ত পশুর কারণে বায়ু চলাচল ও স্বাস্থ্য ঝুঁকি তৈরি হতে পারে।"
                    : "শেডের আকার ও ধারণক্ষমতা আদর্শ মানের মধ্যে রয়েছে।",
            ],
        ]);
    }

    /**
     * Regenerate standard vaccine schedule for plan
     */
    public function generateVaccines(int $id, Request $request): JsonResponse
    {
        $plan = LivestockPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $this->createInitialVaccines($plan, true);
        $plan->load('vaccineSchedules');

        return response()->json([
            'success' => true,
            'message' => 'Vaccine schedules refreshed.',
            'data' => new LivestockPlanResource($plan),
        ]);
    }

    /**
     * Standard capacity per animal
     */
    protected function calculateMaxCapacity(string $type, float $areaSqm): int
    {
        $spacePerAnimalSqm = match ($type) {
            'cow', 'buffalo' => 3.7,  // ~40 sq ft
            'goat', 'sheep' => 1.0,   // ~11 sq ft
            'chicken', 'duck' => 0.15, // ~1.6 sq ft
            default => 2.0,
        };

        return max(1, (int)floor($areaSqm / $spacePerAnimalSqm));
    }

    protected function calculateDailyFeed(string $type, int $count): float
    {
        $feedPerAnimalKg = match ($type) {
            'cow', 'buffalo' => 12.0, // Straw + Green grass + Concentrate
            'goat', 'sheep' => 1.5,
            'chicken', 'duck' => 0.12,
            default => 2.0,
        };

        return round($feedPerAnimalKg * $count, 2);
    }

    protected function calculateDailyWater(string $type, int $count): float
    {
        $waterPerAnimalL = match ($type) {
            'cow', 'buffalo' => 45.0,
            'goat', 'sheep' => 5.0,
            'chicken', 'duck' => 0.35,
            default => 10.0,
        };

        return round($waterPerAnimalL * $count, 2);
    }

    protected function createInitialVaccines(LivestockPlan $plan, bool $overwrite = false): void
    {
        if ($overwrite) {
            VaccineSchedule::where('livestock_plan_id', $plan->id)->delete();
        }

        $today = Carbon::today();

        if (in_array($plan->animal_type, ['cow', 'buffalo'])) {
            $vaccines = [
                ['name' => 'FMD (Foot and Mouth)', 'name_bn' => 'ক্ষুরারোগের টিকা (FMD)', 'days' => 14, 'freq' => 'প্রতি ৬ মাস পর পর'],
                ['name' => 'Anthrax', 'name_bn' => 'তড়কা রোগের টিকা (Anthrax)', 'days' => 45, 'freq' => 'প্রতি ১ বছর পর পর'],
                ['name' => 'Black Quarter (BQ)', 'name_bn' => 'বাদলা রোগের টিকা (BQ)', 'days' => 75, 'freq' => 'প্রতি ১ বছর পর পর'],
                ['name' => 'Haemorrhagic Septicaemia (HS)', 'name_bn' => 'গলাফুলা রোগের টিকা (HS)', 'days' => 105, 'freq' => 'প্রতি ৬ মাস পর পর'],
            ];
        } elseif (in_array($plan->animal_type, ['goat', 'sheep'])) {
            $vaccines = [
                ['name' => 'PPR Vaccine', 'name_bn' => 'পিপিআর (PPR) টিকা', 'days' => 10, 'freq' => 'প্রতি ১ বছর পর পর'],
                ['name' => 'Goat Pox', 'name_bn' => 'ছাগলের বসন্ত টিকা', 'days' => 40, 'freq' => 'প্রতি ১ বছর পর পর'],
            ];
        } else {
            // Poultry
            $vaccines = [
                ['name' => 'Ranikhet (BCRDV)', 'name_bn' => 'রানীক্ষেত টিকা (বিসিআরডিভি)', 'days' => 5, 'freq' => 'চোখে ড্রপ'],
                ['name' => 'Gumboro', 'name_bn' => 'গামবোরো টিকা', 'days' => 14, 'freq' => 'খাবার পানিতে'],
                ['name' => 'Ranikhet (RDV Booster)', 'name_bn' => 'রানীক্ষেত বুস্টার (আরডিভি)', 'days' => 28, 'freq' => 'মাংসপেশিতে ইনজেকশন'],
            ];
        }

        foreach ($vaccines as $v) {
            VaccineSchedule::create([
                'livestock_plan_id' => $plan->id,
                'vaccine_name' => $v['name'],
                'vaccine_name_bn' => $v['name_bn'],
                'frequency' => $v['freq'],
                'due_date' => $today->copy()->addDays($v['days']),
                'reminder_sent' => false,
            ]);
        }
    }
}
