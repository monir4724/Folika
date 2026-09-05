<?php

namespace App\Http\Controllers\Api\Fish;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fish\StoreFishPlanRequest;
use App\Http\Requests\Fish\StoreSpeciesSelectionRequest;
use App\Http\Resources\FishPlanResource;
use App\Models\FishPlan;
use App\Models\FishSpeciesSelection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FishPlanController extends Controller
{
    /**
     * List user's fish plans
     */
    public function index(Request $request): JsonResponse
    {
        $plans = FishPlan::where('user_id', $request->user()->id)
            ->with(['speciesSelections.species'])
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => FishPlanResource::collection($plans),
        ]);
    }

    /**
     * Store new fish farming plan
     */
    public function store(StoreFishPlanRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $validated['user_id'] = $user->id;

        // Auto-calculate pond dimensions & lime/fertilizer if not set
        if (isset($validated['pond_length_m'], $validated['pond_width_m'])) {
            $length = (float)$validated['pond_length_m'];
            $width = (float)$validated['pond_width_m'];
            $depth = (float)($validated['pond_depth_m'] ?? 1.5);

            $sqm = $length * $width;
            $shatok = $sqm / 40.4686;
            $validated['pond_area_sqm'] = $sqm;
            $validated['pond_volume_m3'] = $sqm * $depth;

            if (!isset($validated['lime_kg']) || $validated['lime_kg'] == 0) {
                // 1 kg lime per shatok
                $validated['lime_kg'] = round($shatok * 1.0, 2);
            }
            if (!isset($validated['organic_fertilizer_kg']) || $validated['organic_fertilizer_kg'] == 0) {
                // 5-7 kg cow dung per shatok
                $validated['organic_fertilizer_kg'] = round($shatok * 6.0, 2);
            }
        }

        $speciesData = $validated['species'] ?? [];
        unset($validated['species']);

        $plan = FishPlan::create($validated);

        // Store species selections
        if (!empty($speciesData)) {
            foreach ($speciesData as $spec) {
                FishSpeciesSelection::create([
                    'fish_plan_id' => $plan->id,
                    'species_id' => $spec['species_id'],
                    'water_layer' => $spec['water_layer'],
                    'quantity' => $spec['quantity'],
                    'stocking_density_per_sqm' => $plan->pond_area_sqm > 0 ? round($spec['quantity'] / $plan->pond_area_sqm, 2) : 0,
                ]);
            }
        }

        $plan->load(['speciesSelections.species']);

        return response()->json([
            'success' => true,
            'message' => 'Fish plan created successfully.',
            'data' => new FishPlanResource($plan),
        ], 201);
    }

    /**
     * Show single fish plan
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $plan = FishPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with(['speciesSelections.species'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new FishPlanResource($plan),
        ]);
    }

    /**
     * Update fish plan
     */
    public function update(int $id, Request $request): JsonResponse
    {
        $plan = FishPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $plan->update($request->all());
        $plan->load(['speciesSelections.species']);

        return response()->json([
            'success' => true,
            'message' => 'Fish plan updated successfully.',
            'data' => new FishPlanResource($plan),
        ]);
    }

    /**
     * Soft delete fish plan
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $plan = FishPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fish plan deleted successfully.',
        ]);
    }

    /**
     * Add species selection to fish plan
     */
    public function addSpecies(int $id, StoreSpeciesSelectionRequest $request): JsonResponse
    {
        $plan = FishPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validated();
        $validated['fish_plan_id'] = $plan->id;
        if (!isset($validated['stocking_density_per_sqm']) && $plan->pond_area_sqm > 0) {
            $validated['stocking_density_per_sqm'] = round($validated['quantity'] / $plan->pond_area_sqm, 2);
        }

        $selection = FishSpeciesSelection::create($validated);
        $selection->load('species');

        return response()->json([
            'success' => true,
            'message' => 'Fish species added to plan.',
            'data' => $selection,
        ], 201);
    }

    /**
     * Calculate automatic pond layer guidelines based on depth
     */
    public function calculateLayers(Request $request): JsonResponse
    {
        $request->validate([
            'pond_depth_m' => 'nullable|numeric|min:0.2',
            'pond_depth_ft' => 'nullable|numeric|min:0.5',
            'pond_area_sqm' => 'nullable|numeric|min:0',
            'pond_length_ft' => 'nullable|numeric|min:0',
            'pond_width_ft' => 'nullable|numeric|min:0',
        ]);

        $rawFt = $request->input('pond_depth_ft', $request->input('pond_depth'));
        $depthFt = (float) ($rawFt ?? 0);
        $depthM = (float) $request->input('pond_depth_m', 0);
        if ($depthFt <= 0 && $depthM > 0) {
            $depthFt = $depthM * 3.28084;
        }
        if ($depthM <= 0 && $depthFt > 0) {
            $depthM = $depthFt / 3.28084;
        }
        if ($depthFt <= 0) {
            return response()->json(['success' => false, 'message' => 'Pond depth is required.'], 422);
        }

        if ($rawFt !== null && $rawFt !== '') {
            $depthFt = (float) max(1, (int) round((float) $rawFt));
            $depthM = $depthFt / 3.28084;
        }

        $area = (float) $request->input('pond_area_sqm', 0);
        if ($area <= 0) {
            $len = (float) $request->input('pond_length_ft', 0);
            $wid = (float) $request->input('pond_width_ft', 0);
            if ($len > 0 && $wid > 0) {
                $area = $len * $wid * 0.092903;
            }
        }
        $shatok = $area > 0 ? $area / 40.4686 : 0;

        if ($depthFt < 4) {
            $count = 1;
            $keys = ['shallow'];
            $reason = 'গভীরতা ৪ ফুটের কম — এক স্তর (কৈ/মাগুর/শিং/তেলাপিয়া) সবচেয়ে নিরাপদ।';
            $reasonEn = 'Under 4 ft: one layer of air-breathing / hardy fish is safest.';
        } elseif ($depthFt < 6) {
            $count = 2;
            $keys = ['surface', 'middle'];
            $reason = '৪–৬ ফুট — দুই স্তর (উপরিভাগ + মধ্যস্তর) সবচেয়ে ভালো।';
            $reasonEn = '4–6 ft: two layers (surface + mid) is best.';
        } else {
            $count = 3;
            $keys = ['surface', 'middle', 'bottom'];
            $reason = '৬ ফুট বা বেশি — তিন স্তর মিশ্র চাষ আদর্শ।';
            $reasonEn = '6 ft or more: three-layer polyculture is best.';
        }

        $catalog = [
            'shallow' => ['tilapia', 'koi', 'magur', 'shing', 'bagda'],
            'surface' => ['katla', 'silver', 'bighead', 'tilapia'],
            'middle' => ['rui', 'grass', 'pangas', 'pabda', 'bagda'],
            'bottom' => ['mrigel', 'carpio', 'golda', 'gulsha', 'tengra', 'bagda'],
        ];
        $titles = [
            'shallow' => 'এক স্তর (অগভীর পুকুর)',
            'surface' => 'উপরিভাগ',
            'middle' => 'মধ্যস্তর',
            'bottom' => 'তলদেশ',
        ];

        $layers = [];
        foreach ($keys as $key) {
            $ids = $catalog[$key];
            if ($key === 'middle' && $depthFt < 6) {
                $ids = array_values(array_filter($ids, fn ($id) => $id !== 'pangas'));
            }
            $layers[] = [
                'key' => $key,
                'title_bn' => $titles[$key],
                'species_ids' => $ids,
            ];
        }

        $totalFingerlings = $shatok > 0 ? (int) round($shatok * 45) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'layer_count' => $count,
                'depth_ft' => round($depthFt, 2),
                'depth_m' => round($depthM, 2),
                'reason_bn' => $reason,
                'reason_en' => $reasonEn,
                'pond_shatok' => round($shatok, 2),
                'lime_required_kg' => round($shatok * 1.0, 1),
                'dung_required_kg' => round($shatok * 6.0, 1),
                'total_recommended_fingerlings' => $totalFingerlings,
                'layers' => $layers,
            ],
        ]);
    }
}
