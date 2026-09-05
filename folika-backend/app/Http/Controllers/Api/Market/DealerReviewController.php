<?php

namespace App\Http\Controllers\Api\Market;

use App\Http\Controllers\Controller;
use App\Http\Requests\Market\StoreDealerReviewRequest;
use App\Http\Resources\DealerReviewResource;
use App\Models\Dealer;
use App\Models\DealerReview;
use Illuminate\Http\JsonResponse;

class DealerReviewController extends Controller
{
    /**
     * Submit rating & review for a dealer shop
     */
    public function store(int $dealerId, StoreDealerReviewRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $dealer = Dealer::findOrFail($dealerId);

        if ($dealer->user_id === $userId) {
            return response()->json([
                'success' => false,
                'error_code' => 'self_review_forbidden',
                'message' => 'Dealers cannot review their own shop.',
            ], 403);
        }

        $validated = $request->validated();
        $validated['dealer_id'] = $dealerId;
        $validated['user_id'] = $userId;

        $review = DealerReview::updateOrCreate(
            ['dealer_id' => $dealerId, 'user_id' => $userId],
            $validated
        );

        // Recalculate average rating & review count
        $avg = DealerReview::where('dealer_id', $dealerId)->avg('rating');
        $count = DealerReview::where('dealer_id', $dealerId)->count();

        $dealer->update([
            'avg_rating' => round($avg, 2),
            'review_count' => $count,
        ]);

        $review->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully.',
            'data' => new DealerReviewResource($review),
        ], 201);
    }
}
