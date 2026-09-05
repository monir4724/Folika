<?php

namespace App\Services;

use App\Exceptions\SmsDeliveryException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected string $apiToken;
    protected string $sid;
    protected string $apiUrl;

    public function __construct()
    {
        $this->apiToken = config('services.ssl_wireless.api_token', env('SSL_WIRELESS_API_TOKEN', 'mock_ssl_token'));
        $this->sid = config('services.ssl_wireless.sid', env('SSL_WIRELESS_SID', 'mock_ssl_sid'));
        $this->apiUrl = config('services.ssl_wireless.url', env('SSL_WIRELESS_URL', 'https://smsplus.sslwireless.com/api/v3/send-sms'));
    }

    /**
     * Send OTP SMS to Bangladeshi mobile number
     *
     * @param string $mobile
     * @param string $otp
     * @return bool
     * @throws SmsDeliveryException
     */
    public function sendOtp(string $mobile, string $otp): bool
    {
        $message = "আপনার ফলিকা (FOLIKA) যাচাইকরণ কোড হলো: {$otp}। কোডটির মেয়াদ ৫ মিনিট। কাউকে শেয়ার করবেন না।";
        return $this->sendSms($mobile, $message, 'otp');
    }

    /**
     * Send general SMS notification
     *
     * @param string $mobile
     * @param string $message
     * @param string $tag
     * @return bool
     * @throws SmsDeliveryException
     */
    public function sendSms(string $mobile, string $message, string $tag = 'general'): bool
    {
        // Format BD mobile number e.g. 88017XXXXXXXX
        $formattedMobile = $this->formatMobile($mobile);

        // In local/testing/mock mode, simulate success and log to stack
        if (app()->environment('local', 'testing') || $this->apiToken === 'mock_ssl_token') {
            Log::info("[MOCK SMS SERVICE] [Tag: {$tag}] Sent to {$formattedMobile}: {$message}");
            return true;
        }

        try {
            $response = Http::timeout(10)->post($this->apiUrl, [
                'api_token' => $this->apiToken,
                'sid' => $this->sid,
                'msisdn' => $formattedMobile,
                'sms' => $message,
                'csms_id' => uniqid('FOLIKA_'),
            ]);

            if ($response->successful() && ($response->json('status_code') == 200 || $response->json('status') === 'SUCCESS')) {
                Log::info("[SMS SENT] To {$formattedMobile}");
                return true;
            }

            Log::error("[SMS GATEWAY ERROR] To {$formattedMobile}: " . $response->body());
            throw new SmsDeliveryException("SMS gateway rejected request with status: " . $response->status());
        } catch (\Throwable $e) {
            Log::error("[SMS EXCEPTION] Failed to send SMS to {$formattedMobile}: " . $e->getMessage());
            throw new SmsDeliveryException("Failed to transmit SMS: " . $e->getMessage());
        }
    }

    /**
     * Normalize BD mobile numbers to 8801XXXXXXXXX
     */
    protected function formatMobile(string $mobile): string
    {
        $digits = preg_replace('/[^0-9]/', '', $mobile);
        if (str_starts_with($digits, '8801')) {
            return $digits;
        }
        if (str_starts_with($digits, '01')) {
            return '88' . $digits;
        }
        return '880' . ltrim($digits, '0');
    }
}
