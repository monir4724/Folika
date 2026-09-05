<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    protected ?string $serverKey;
    protected SmsService $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->serverKey = config('services.firebase.server_key', env('FIREBASE_SERVER_KEY', 'mock_fcm_key'));
        $this->smsService = $smsService;
    }

    /**
     * Send Push Notification via Firebase Cloud Messaging, with automatic SMS fallback
     *
     * @param string|null $token
     * @param string $title
     * @param string $body
     * @param array $data
     * @param string|null $fallbackMobile
     * @return array [success => bool, channel_used => 'push'|'sms'|'none']
     */
    public function sendPush(?string $token, string $title, string $body, array $data = [], ?string $fallbackMobile = null): array
    {
        // If FCM token is absent, fallback to SMS immediately
        if (empty($token) || $this->serverKey === 'mock_fcm_key' || app()->environment('local', 'testing')) {
            Log::info("[MOCK FCM PUSH] Title: {$title} | Body: {$body} | Target: " . ($token ?? 'No token'));
            
            if (empty($token) && !empty($fallbackMobile)) {
                try {
                    $this->smsService->sendSms($fallbackMobile, "{$title}: {$body}", 'fcm_fallback');
                    return ['success' => true, 'channel_used' => 'sms'];
                } catch (\Throwable $e) {
                    Log::warning("[FCM FALLBACK SMS FAILED] Mobile {$fallbackMobile}: " . $e->getMessage());
                }
            }
            return ['success' => true, 'channel_used' => 'push'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'key=' . $this->serverKey,
                'Content-Type' => 'application/json',
            ])->timeout(8)->post('https://fcm.googleapis.com/fcm/send', [
                'to' => $token,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'sound' => 'default',
                    'icon' => 'assets/images/logo.png',
                ],
                'data' => array_merge($data, [
                    'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    'timestamp' => now()->toISOString(),
                ]),
            ]);

            if ($response->successful() && $response->json('success') == 1) {
                Log::info("[FCM SENT] Successfully delivered push to token {$token}");
                return ['success' => true, 'channel_used' => 'push'];
            }

            Log::warning("[FCM FAILED] Status {$response->status()}, Body: {$response->body()} -> attempting SMS fallback");
        } catch (\Throwable $e) {
            Log::error("[FCM EXCEPTION] {$e->getMessage()} -> attempting SMS fallback");
        }

        // Automatic fallback path to SMS
        if (!empty($fallbackMobile)) {
            try {
                $this->smsService->sendSms($fallbackMobile, "{$title}: {$body}", 'fcm_fallback');
                return ['success' => true, 'channel_used' => 'sms'];
            } catch (\Throwable $e) {
                Log::error("[FCM FALLBACK TO SMS FAILED] Mobile {$fallbackMobile}: " . $e->getMessage());
            }
        }

        return ['success' => false, 'channel_used' => 'none'];
    }
}
