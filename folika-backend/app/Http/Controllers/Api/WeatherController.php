<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    protected WeatherService $weatherService;

    public function __construct(WeatherService $weatherService)
    {
        $this->weatherService = $weatherService;
    }

    /**
     * Get live or fallback current weather
     */
    public function current(Request $request): JsonResponse
    {
        $user = $request->user();
        $lat = (float)($request->input('lat', $user?->latitude ?? 24.6738));
        $lon = (float)($request->input('lon', $user?->longitude ?? 89.4184));
        $upazilaId = $request->input('upazila_id', $user?->upazila_id);

        $weather = $this->weatherService->getCurrent($lat, $lon, $upazilaId);

        return response()->json([
            'success' => true,
            'data' => $weather,
        ]);
    }

    /**
     * Get 5-day weather forecast with irrigation guidelines
     */
    public function forecast(Request $request): JsonResponse
    {
        $user = $request->user();
        $lat = (float)($request->input('lat', $user?->latitude ?? 24.6738));
        $lon = (float)($request->input('lon', $user?->longitude ?? 89.4184));
        $upazilaId = $request->input('upazila_id', $user?->upazila_id);

        $forecast = $this->weatherService->getForecast($lat, $lon, $upazilaId);

        return response()->json([
            'success' => true,
            'data' => $forecast,
        ]);
    }

    /**
     * Get agricultural weather alerts (e.g. cold wave, heavy rain, cyclone warning)
     */
    public function alerts(Request $request): JsonResponse
    {
        $user = $request->user();
        $alerts = [
            [
                'id' => 'alert_rabi_1',
                'severity' => 'info',
                'title' => 'কুয়াশা ও মৃদু শৈত্যপ্রবাহের পূর্বাভাস',
                'body' => 'আগামী ৩ দিন রাতের তাপমাত্রা হ্রাস পেতে পারে। বোরো বীজতলায় স্বচ্ছ পলিথিন দিয়ে ঢেকে রাখুন ও বিকেলে জমে থাকা পানি পরিবর্তন করুন।',
                'issued_at' => now()->format('Y-m-d H:i'),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $alerts,
        ]);
    }
}
