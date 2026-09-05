<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\OnboardingRequest;
use App\Http\Resources\UserResource;
use App\Models\Upazila;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Get authenticated user profile
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['division', 'district', 'upazila']);
        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Complete user onboarding profile
     */
    public function onboarding(OnboardingRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Auto-resolve AEZ code from upazila
        $upazila = Upazila::find($validated['upazila_id']);
        if ($upazila) {
            $validated['aez_code'] = $upazila->aez_code;
        }

        $user->update($validated);
        $user->load(['division', 'district', 'upazila']);

        return response()->json([
            'success' => true,
            'message' => 'Profile completed successfully.',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Logout current device
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out.',
        ]);
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out from all devices.',
        ]);
    }
}
