<?php

namespace App\Jobs;

use App\Models\CropPlan;
use App\Models\FishPlan;
use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\LivestockPlan;
use App\Models\OfflineSyncQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RetryOfflineSyncQueue implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Log::info('[JOB START] RetryOfflineSyncQueue');

        $pending = OfflineSyncQueue::where('status', 'failed')
            ->where('retry_count', '<', 3)
            ->get();

        foreach ($pending as $item) {
            $payload = $item->payload_json;
            $payload['user_id'] = $item->user_id;

            DB::beginTransaction();
            try {
                switch ($item->action_type) {
                    case 'create_crop_plan':
                        CropPlan::create($payload);
                        break;
                    case 'create_fish_plan':
                        FishPlan::create($payload);
                        break;
                    case 'create_livestock_plan':
                        LivestockPlan::create($payload);
                        break;
                    case 'create_post':
                        ForumPost::create($payload);
                        break;
                    case 'create_reply':
                        ForumReply::create($payload);
                        break;
                }

                $item->update([
                    'status' => 'synced',
                    'synced_at' => now(),
                ]);
                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                $item->increment('retry_count');
                Log::warning("[RETRY SYNC FAILED] ID: {$item->id}: " . $e->getMessage());
            }
        }

        Log::info('[JOB COMPLETE] RetryOfflineSyncQueue finished.');
    }
}
