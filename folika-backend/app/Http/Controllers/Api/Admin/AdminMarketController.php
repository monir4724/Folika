<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Dealer;
use App\Models\MarketPrice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMarketController extends Controller
{
    /**
     * Verify market price submitted by community
     */
    public function verifyPrice(int $id, Request $request): JsonResponse
    {
        $price = MarketPrice::findOrFail($id);
        $price->update([
            'verified' => true,
            'source' => 'admin_verified',
        ]);

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $request->user()->id,
            'action' => 'verify_market_price',
            'target_type' => 'market_price',
            'target_id' => $price->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Market price verified.',
            'data' => $price,
        ]);
    }

    /**
     * Toggle dealer verification badge
     */
    public function verifyDealer(int $id, Request $request): JsonResponse
    {
        $dealer = Dealer::findOrFail($id);
        $dealer->update(['is_verified' => !$dealer->is_verified]);

        return response()->json([
            'success' => true,
            'message' => 'Dealer verification updated.',
            'is_verified' => (bool)$dealer->is_verified,
        ]);
    }
}
