<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SystemController extends Controller
{
    /**
     * Public runtime configuration consumed by the frontend on boot.
     * Exposes only browser-safe values (Google Maps browser key, locale, app meta).
     */
    public function config(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'app_name' => config('app.name', 'FOLIKA'),
                'primary_language' => 'bn',
                'secondary_language' => 'en',
                'locale' => config('app.locale', 'bn'),
                'fallback_locale' => config('app.fallback_locale', 'en'),
                'google_maps_api_key' => config('services.google_maps.api_key'),
                'weather_enabled' => !empty(config('services.openweather.api_key')),
                'api_version' => 'v1',
            ],
        ]);
    }

    /**
     * Lightweight health check for frontend connectivity detection.
     */
    public function health(): JsonResponse
    {
        $dbOk = true;
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $dbOk = false;
        }

        return response()->json([
            'success' => true,
            'status' => 'ok',
            'database' => $dbOk ? 'connected' : 'unavailable',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
