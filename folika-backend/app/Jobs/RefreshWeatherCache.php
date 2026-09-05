<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\WeatherService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RefreshWeatherCache implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(WeatherService $weatherService): void
    {
        Log::info('[JOB START] RefreshWeatherCache');

        // Refresh weather for unique user locations
        $locations = User::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->select('latitude', 'longitude', 'upazila_id')
            ->distinct()
            ->limit(50)
            ->get();

        foreach ($locations as $loc) {
            $weatherService->getCurrent((float)$loc->latitude, (float)$loc->longitude, $loc->upazila_id);
        }

        Log::info('[JOB COMPLETE] RefreshWeatherCache finished.');
    }
}
