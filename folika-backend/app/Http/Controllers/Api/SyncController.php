<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sync\OfflineSyncRequest;
use App\Models\CropPlan;
use App\Models\FishPlan;
use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\LivestockPlan;
use App\Models\OfflineSyncQueue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncController extends Controller
{
    /**
     * Process batch of offline queued items from mobile client
     */
    public function sync(OfflineSyncRequest $request): JsonResponse
    {
        $user = $request->user();
        $items = $request->validated('queue');
        $syncedIds = [];
        $failedIds = [];

        foreach ($items as $item) {
            $actionType = $item['action_type'];
            $payload = $item['payload'];

            $queueRecord = OfflineSyncQueue::create([
                'user_id' => $user->id,
                'action_type' => $actionType,
                'payload_json' => $payload,
                'status' => 'pending',
            ]);

            DB::beginTransaction();
            try {
                switch ($actionType) {
                    case 'create_crop_plan':
                        $payload['user_id'] = $user->id;
                        CropPlan::create($payload);
                        break;

                    case 'create_fish_plan':
                        $payload['user_id'] = $user->id;
                        FishPlan::create($payload);
                        break;

                    case 'create_livestock_plan':
                        $payload['user_id'] = $user->id;
                        LivestockPlan::create($payload);
                        break;

                    case 'create_post':
                        $payload['user_id'] = $user->id;
                        ForumPost::create($payload);
                        break;

                    case 'create_reply':
                        $payload['user_id'] = $user->id;
                        ForumReply::create($payload);
                        break;
                }

                $queueRecord->update([
                    'status' => 'synced',
                    'synced_at' => now(),
                ]);
                DB::commit();
                $syncedIds[] = $queueRecord->id;
            } catch (\Throwable $e) {
                DB::rollBack();
                Log::error("[OFFLINE SYNC FAILED] Action: {$actionType}, User: {$user->id}, Error: " . $e->getMessage());
                $queueRecord->update([
                    'status' => 'failed',
                    'retry_count' => $queueRecord->retry_count + 1,
                ]);
                $failedIds[] = [
                    'id' => $queueRecord->id,
                    'action' => $actionType,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Offline synchronization processed.',
            'synced_count' => count($syncedIds),
            'failed_count' => count($failedIds),
            'failed_items' => $failedIds,
        ]);
    }

    /**
     * Get offline sync status
     */
    public function status(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $pending = OfflineSyncQueue::where('user_id', $userId)->where('status', 'pending')->count();
        $synced = OfflineSyncQueue::where('user_id', $userId)->where('status', 'synced')->count();
        $failed = OfflineSyncQueue::where('user_id', $userId)->where('status', 'failed')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'pending' => $pending,
                'synced' => $synced,
                'failed' => $failed,
            ],
        ]);
    }
}
