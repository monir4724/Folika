<?php

namespace App\Jobs;

use App\Models\NotificationQueue;
use App\Models\VaccineSchedule;
use App\Services\FcmService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendVaccineReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(FcmService $fcmService): void
    {
        Log::info('[JOB START] SendVaccineReminders');
        $targetDate = Carbon::today()->addDays(3);

        $schedules = VaccineSchedule::with('livestockPlan.user')
            ->where('reminder_sent', false)
            ->whereNull('completed_at')
            ->whereDate('due_date', '<=', $targetDate)
            ->get();

        foreach ($schedules as $schedule) {
            $user = $schedule->livestockPlan?->user;
            if (!$user || !$user->is_active) {
                continue;
            }

            $title = 'টিকা স্মরণপত্র (ফলিকা)';
            $body = "আপনার খামারের জন্য '{$schedule->vaccine_name_bn}' টিকার সময় আসন্ন (তারিখ: {$schedule->due_date->format('d/m/Y')})। নিকটস্থ প্রাণিসম্পদ অফিসে যোগাযোগ করুন।";

            // Record in notification queue
            NotificationQueue::create([
                'user_id' => $user->id,
                'type' => 'vaccine_reminder',
                'channel' => 'both',
                'title' => $title,
                'body' => $body,
                'fcm_token' => $user->fcm_token,
                'mobile' => $user->mobile,
                'status' => 'sent',
                'scheduled_at' => now(),
                'sent_at' => now(),
            ]);

            // Dispatch push / SMS with automatic fallback
            $fcmService->sendPush($user->fcm_token, $title, $body, ['type' => 'vaccine', 'plan_id' => $schedule->livestock_plan_id], $user->mobile);

            $schedule->update(['reminder_sent' => true]);
        }

        Log::info("[JOB COMPLETE] SendVaccineReminders: processed {$schedules->count()} reminders.");
    }
}
