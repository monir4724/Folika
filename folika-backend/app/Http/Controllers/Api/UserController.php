<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ChangePreferencesRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\CropPlan;
use App\Models\FishPlan;
use App\Models\LivestockPlan;
use App\Models\Upazila;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get farmer profile
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load(['division', 'district', 'upazila']);
        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Update farmer profile info
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if (isset($validated['upazila_id'])) {
            $upazila = Upazila::find($validated['upazila_id']);
            if ($upazila) {
                $validated['aez_code'] = $upazila->aez_code;
            }
        }

        $user->update($validated);
        $user->load(['division', 'district', 'upazila']);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Update notification / language preferences
     */
    public function changePreferences(ChangePreferencesRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated successfully.',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Update FCM Push token
     */
    public function updateFcmToken(Request $request): JsonResponse
    {
        $request->validate(['fcm_token' => 'required|string']);
        $request->user()->update(['fcm_token' => $request->input('fcm_token')]);

        return response()->json([
            'success' => true,
            'message' => 'FCM token registered.',
        ]);
    }

    /**
     * Aggregated Farm Summary (financials, plans, acreage, livestock count)
     */
    public function summary(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $cropStats = CropPlan::where('user_id', $userId)
            ->selectRaw('COUNT(*) as total_plans, COALESCE(SUM(land_area_bigha), 0) as total_bigha, COALESCE(SUM(total_cost), 0) as total_cost, COALESCE(SUM(total_revenue), 0) as total_revenue, COALESCE(SUM(net_profit), 0) as total_profit')
            ->first();

        $fishStats = FishPlan::where('user_id', $userId)
            ->selectRaw('COUNT(*) as total_plans, COALESCE(SUM(pond_area_sqm), 0) as total_pond_sqm, COALESCE(SUM(total_cost), 0) as total_cost, COALESCE(SUM(total_revenue), 0) as total_revenue, COALESCE(SUM(net_profit), 0) as total_profit')
            ->first();

        $livestockStats = LivestockPlan::where('user_id', $userId)
            ->selectRaw('COUNT(*) as total_plans, COALESCE(SUM(animal_count), 0) as total_animals, COALESCE(SUM(total_cost), 0) as total_cost, COALESCE(SUM(total_revenue), 0) as total_revenue, COALESCE(SUM(net_profit), 0) as total_profit')
            ->first();

        $totalRevenue = ($cropStats->total_revenue ?? 0) + ($fishStats->total_revenue ?? 0) + ($livestockStats->total_revenue ?? 0);
        $totalCost = ($cropStats->total_cost ?? 0) + ($fishStats->total_cost ?? 0) + ($livestockStats->total_cost ?? 0);
        $netProfit = $totalRevenue - $totalCost;

        return response()->json([
            'success' => true,
            'data' => [
                'crops' => [
                    'active_plans_count' => (int)$cropStats->total_plans,
                    'total_land_bigha' => (float)$cropStats->total_bigha,
                    'total_revenue' => (float)$cropStats->total_revenue,
                    'total_cost' => (float)$cropStats->total_cost,
                    'net_profit' => (float)$cropStats->total_profit,
                ],
                'fish' => [
                    'active_plans_count' => (int)$fishStats->total_plans,
                    'total_pond_sqm' => (float)$fishStats->total_pond_sqm,
                    'total_revenue' => (float)$fishStats->total_revenue,
                    'total_cost' => (float)$fishStats->total_cost,
                    'net_profit' => (float)$fishStats->total_profit,
                ],
                'livestock' => [
                    'active_plans_count' => (int)$livestockStats->total_plans,
                    'total_animal_count' => (int)$livestockStats->total_animals,
                    'total_revenue' => (float)$livestockStats->total_revenue,
                    'total_cost' => (float)$livestockStats->total_cost,
                    'net_profit' => (float)$livestockStats->total_profit,
                ],
                'overall_financials' => [
                    'total_revenue' => (float)$totalRevenue,
                    'total_cost' => (float)$totalCost,
                    'net_profit' => (float)$netProfit,
                    'profit_margin_pct' => $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 2) : 0,
                ],
            ],
        ]);
    }

    /**
     * Compliance Delete Account (Soft Delete)
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();
        $user->update(['is_active' => false]);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully in accordance with compliance guidelines.',
        ]);
    }
}
