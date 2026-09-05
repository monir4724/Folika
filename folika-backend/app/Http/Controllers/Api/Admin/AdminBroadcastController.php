<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BroadcastNotificationRequest;
use App\Models\AuditLog;
use App\Models\NotificationQueue;
use App\Models\User;
use App\Services\FcmService;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;

class AdminBroadcastController extends Controller
{
    protected FcmService $fcmService;
    protected SmsService $smsService;

    public function __construct(FcmService $fcmService, SmsService $smsService)
    {
        $this->fcmService = $fcmService;
        $this->smsService = $smsService;
    }

    /**
     * Broadcast notification to target farmers/dealers
     */
    public function broadcast(BroadcastNotificationRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $title = $validated['title'];
        $body = $validated['body'];
        $channel = $validated['channel'];
        $role = $validated['role_filter'] ?? 'all';

        $query = User::where('is_active', true);
        if ($role !== 'all') {
            $query->where('role', $role);
        }
        if (!empty($validated['district_id'])) {
            $query->where('district_id', $validated['district_id']);
        }
        if (!empty($validated['upazila_id'])) {
            $query->where('upazila_id', $validated['upazila_id']);
        }

        $users = $query->get(['id', 'mobile', 'fcm_token', 'notify_push', 'notify_sms']);
        $queuedCount = 0;

        foreach ($users as $user) {
            NotificationQueue::create([
                'user_id' => $user->id,
                'type' => 'system',
                'channel' => $channel,
                'title' => $title,
                'body' => $body,
                'fcm_token' => $user->fcm_token,
                'mobile' => $user->mobile,
                'status' => 'pending',
                'scheduled_at' => now(),
            ]);
            $queuedCount++;
        }

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $request->user()->id,
            'action' => 'broadcast_notification',
            'details_json' => [
                'title' => $title,
                'recipient_count' => $queuedCount,
                'channel' => $channel,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Broadcast successfully queued for {$queuedCount} recipients.",
            'recipient_count' => $queuedCount,
        ]);
    }
}
