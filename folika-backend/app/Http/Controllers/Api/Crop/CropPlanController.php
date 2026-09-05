<?php

namespace App\Http\Controllers\Api\Crop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Crop\StoreCropPlanRequest;
use App\Http\Requests\Crop\UpdateCropPlanRequest;
use App\Http\Resources\CropMasterResource;
use App\Http\Resources\CropPlanResource;
use App\Models\CropPlan;
use App\Models\CropsMaster;
use App\Services\GroqLlmService;
use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CropPlanController extends Controller
{
    protected GroqLlmService $groqService;
    protected WeatherService $weatherService;

    public function __construct(GroqLlmService $groqService, WeatherService $weatherService)
    {
        $this->groqService = $groqService;
        $this->weatherService = $weatherService;
    }

    /**
     * List user's crop plans
     */
    public function index(Request $request): JsonResponse
    {
        $plans = CropPlan::where('user_id', $request->user()->id)
            ->with(['crop', 'previousCrop', 'costItems', 'revenueItems'])
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => CropPlanResource::collection($plans),
        ]);
    }

    /**
     * Store new crop plan
     */
    public function store(StoreCropPlanRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $validated['user_id'] = $user->id;

        // Auto-calculate land dimensions if provided
        if (isset($validated['land_length_m'], $validated['land_width_m']) && (!isset($validated['land_area_sqm']) || $validated['land_area_sqm'] == 0)) {
            $length = (float)$validated['land_length_m'];
            $width = (float)$validated['land_width_m'];
            $shape = $validated['land_shape'] ?? 'rectangular';

            $sqm = $shape === 'triangular' ? ($length * $width) / 2 : ($length * $width);
            $validated['land_area_sqm'] = $sqm;
            $validated['land_area_shatok'] = round($sqm / 40.4686, 2); // 1 shatok = 40.47 sqm
            $validated['land_area_bigha'] = round($validated['land_area_shatok'] / 33, 2); // 33 shatok = 1 bigha
        }

        // Fetch AI rotation advice if previous crop is specified
        if (!empty($validated['previous_crop_id'])) {
            $targetCrop = CropsMaster::find($validated['crop_id']);
            $prevCrop = CropsMaster::find($validated['previous_crop_id']);
            if ($targetCrop && $prevCrop) {
                $advice = $this->groqService->getCropRotationAdvice(
                    $prevCrop->name_bn,
                    $targetCrop->name_bn,
                    $user->aez_code,
                    $validated['soil_type'] ?? null
                );
                $validated['ai_rotation_note'] = $advice['advice_bn'] ?? null;
            }
        }

        $plan = CropPlan::create($validated);
        $plan->load(['crop', 'previousCrop', 'costItems', 'revenueItems']);

        return response()->json([
            'success' => true,
            'message' => 'Crop plan created successfully.',
            'data' => new CropPlanResource($plan),
        ], 201);
    }

    /**
     * Show single crop plan with ownership check
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $plan = CropPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with(['crop', 'previousCrop', 'costItems', 'revenueItems'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new CropPlanResource($plan),
        ]);
    }

    /**
     * Update crop plan with ownership check
     */
    public function update(int $id, UpdateCropPlanRequest $request): JsonResponse
    {
        $plan = CropPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $plan->update($request->validated());
        $plan->load(['crop', 'previousCrop', 'costItems', 'revenueItems']);

        return response()->json([
            'success' => true,
            'message' => 'Crop plan updated successfully.',
            'data' => new CropPlanResource($plan),
        ]);
    }

    /**
     * Soft delete crop plan
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $plan = CropPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Crop plan deleted successfully.',
        ]);
    }

    /**
     * Get all master crops
     */
    public function master(Request $request): JsonResponse
    {
        $crops = CropsMaster::all();
        return response()->json([
            'success' => true,
            'data' => CropMasterResource::collection($crops),
        ]);
    }

    /**
     * Recommend crops based on season and user's AEZ
     */
    public function recommendations(Request $request): JsonResponse
    {
        $user = $request->user();
        $season = $request->input('season', 'rabi');
        $aezCode = (int)($request->input('aez_code', $user?->aez_code ?? 4));

        $crops = CropsMaster::all()->filter(function ($crop) use ($season, $aezCode) {
            $seasons = is_array($crop->suitable_seasons) ? $crop->suitable_seasons : [];
            $aezList = is_array($crop->suitable_aez) ? $crop->suitable_aez : [];

            $seasonMatch = empty($seasons) || in_array($season, $seasons) || in_array('year_round', $seasons);
            $aezMatch = empty($aezList) || in_array($aezCode, $aezList);

            return $seasonMatch && $aezMatch;
        });

        return response()->json([
            'success' => true,
            'data' => CropMasterResource::collection($crops->values()),
        ]);
    }

    /**
     * Get AI Crop rotation advice
     */
    public function rotationAdvice(Request $request): JsonResponse
    {
        $request->validate([
            'target_crop' => 'required|string',
            'previous_crop' => 'nullable|string',
        ]);

        $user = $request->user();
        $advice = $this->groqService->getCropRotationAdvice(
            $request->input('previous_crop'),
            $request->input('target_crop'),
            $user?->aez_code,
            $request->input('soil_type')
        );

        return response()->json([
            'success' => true,
            'data' => $advice,
        ]);
    }

    /**
     * Weather and irrigation advice for crops
     */
    public function weatherIrrigation(Request $request): JsonResponse
    {
        $user = $request->user();
        $lat = (float)($request->input('lat', $user?->latitude ?? 24.6738));
        $lon = (float)($request->input('lon', $user?->longitude ?? 89.4184));
        $upazilaId = $request->input('upazila_id', $user?->upazila_id);

        $weather = $this->weatherService->getCurrent($lat, $lon, $upazilaId);

        $advice = [
            'weather' => $weather,
            'irrigation_status' => $weather['rain_prob_pct'] > 60 ? 'স্থগিত রাখুন' : 'প্রয়োজন',
            'advice_bn' => $weather['rain_prob_pct'] > 60 
                ? 'আগামী ২৪ ঘণ্টায় বৃষ্টির সম্ভাবনা রয়েছে। সেচ দেওয়া আপাতত স্থগিত রাখুন এবং ড্রেনেজ লাইন পরিষ্কার রাখুন।'
                : 'মাটিতে আর্দ্রতার ঘাটতি দেখা দিতে পারে। বিকেলে ফসলে হালকা সেচ প্রদান করুন।',
        ];

        return response()->json([
            'success' => true,
            'data' => $advice,
        ]);
    }
}
