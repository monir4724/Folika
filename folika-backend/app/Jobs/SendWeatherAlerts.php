<?php

namespace App\Jobs;

use App\Models\NotificationQueue;
use App\Models\User;
use App\Services\FcmService;
use App\Services\WeatherService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWeatherAlerts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(FcmService $fcmService, WeatherService $weatherService): void
    {
        Log::info('[JOB START] SendWeatherAlerts');

        $users = User::where('is_active', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        foreach ($users as $user) {
            $weather = $weatherService->getCurrent((float)$user->latitude, (float)$user->longitude, $user->upazila_id);

            // If high rain or extreme condition
            if (($weather['rain_prob_pct'] ?? 0) >= 80) {
                $title = 'ভারী বৃষ্টির সতর্কতা (ফলিকা)';
                $body = "আপনার এলাকায় আগামী ২৪ ঘণ্টায় ভারী বৃষ্টির সম্ভাবনা রয়েছে। জমির ড্রেন ও পুকুরের পাড় সুরক্ষিত রাখুন।";

                NotificationQueue::create([
                    'user_id' => $user->id,
                    'type' => 'weather_alert',
                    'channel' => 'both',
                    'title' => $title,
                    'body' => $body,
                    'fcm_token' => $user->fcm_token,
                    'mobile' => $user->mobile,
                    'status' => 'sent',
                    'scheduled_at' => now(),
                    'sent_at' => now(),
                ]);

                $fcmService->sendPush($user->fcm_token, $title, $body, ['type' => 'weather_alert'], $user->mobile);
            }
        }

        Log::info('[JOB COMPLETE] SendWeatherAlerts finished.');
    }
}
