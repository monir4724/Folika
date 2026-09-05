<?php

namespace App\Http\Controllers\Api\Market;

use App\Http\Controllers\Controller;
use App\Http\Resources\DealerResource;
use App\Models\Dealer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DealerController extends Controller
{
    /**
     * List verified dealers with upazila & shop_type filters
     */
    public function index(Request $request): JsonResponse
    {
        $upazilaId = $request->input('upazila_id');
        $shopType = $request->input('shop_type');
        $search = $request->input('search');

        $query = Dealer::with(['upazila.district', 'reviews.user']);

        if ($upazilaId) {
            $query->where('upazila_id', $upazilaId);
        }

        if ($shopType && in_array($shopType, ['seed', 'fertilizer', 'pesticide', 'equipment', 'general'])) {
            $query->where('shop_type', $shopType);
        }

        if ($search) {
            $query->where('shop_name', 'LIKE', "%{$search}%");
        }

        $dealers = $query->orderByDesc('avg_rating')->get();

        return response()->json([
            'success' => true,
            'data' => DealerResource::collection($dealers),
        ]);
    }

    /**
     * Single dealer detail with reviews
     */
    public function show(int $id): JsonResponse
    {
        $dealer = Dealer::with(['upazila.district', 'reviews.user'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new DealerResource($dealer),
        ]);
    }

    /**
     * My dealer shop profile (for dealer role)
     */
    public function myShop(Request $request): JsonResponse
    {
        $user = $request->user();
        $dealer = Dealer::with(['upazila.district', 'reviews.user'])->where('user_id', $user->id)->first();

        if (!$dealer) {
            return response()->json([
                'success' => false,
                'error_code' => 'dealer_not_found',
                'message' => 'You do not have a dealer shop registered.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new DealerResource($dealer),
        ]);
    }
}
