<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\NotificationQueue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List user notifications
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = NotificationQueue::where('user_id', $request->user()->id)
            ->latest('id')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => NotificationResource::collection($notifications),
        ]);
    }

    /**
     * Mark single notification as read
     */
    public function read(int $id, Request $request): JsonResponse
    {
        $notification = NotificationQueue::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notification->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function readAll(Request $request): JsonResponse
    {
        NotificationQueue::where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }
}
