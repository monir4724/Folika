<?php

namespace App\Jobs;

use App\Models\CropPlan;
use App\Models\FishPlan;
use App\Models\LivestockPlan;
use App\Models\NotificationQueue;
use App\Models\User;
use App\Services\FcmService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWeeklyFarmSummary implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(FcmService $fcmService): void
    {
        Log::info('[JOB START] SendWeeklyFarmSummary');

        $users = User::where('is_active', true)->where('role', 'farmer')->get();

        foreach ($users as $user) {
            $cropProfit = CropPlan::where('user_id', $user->id)->sum('net_profit');
            $fishProfit = FishPlan::where('user_id', $user->id)->sum('net_profit');
            $livestockProfit = LivestockPlan::where('user_id', $user->id)->sum('net_profit');

            $totalNetProfit = $cropProfit + $fishProfit + $livestockProfit;
            $title = 'সাপ্তাহিক খামার রিপোর্ট (ফলিকা)';
            $body = "সম্মানিত {$user->name}, আপনার চলতি খামারের সামগ্রিক প্রাক্কলিত লাভ: ৳" . number_format($totalNetProfit, 0) . "। বিস্তারিত দেখতে ফলিকা অ্যাপে প্রবেশ করুন।";

            NotificationQueue::create([
                'user_id' => $user->id,
                'type' => 'plan_reminder',
                'channel' => 'both',
                'title' => $title,
                'body' => $body,
                'fcm_token' => $user->fcm_token,
                'mobile' => $user->mobile,
                'status' => 'sent',
                'scheduled_at' => now(),
                'sent_at' => now(),
            ]);

            $fcmService->sendPush($user->fcm_token, $title, $body, ['type' => 'weekly_summary'], $user->mobile);
        }

        Log::info('[JOB COMPLETE] SendWeeklyFarmSummary finished.');
    }
}
