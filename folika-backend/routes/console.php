<?php

use App\Jobs\RefreshWeatherCache;
use App\Jobs\RetryFailedOfflineDiseaseAnalyses;
use App\Jobs\RetryOfflineSyncQueue;
use App\Jobs\SendVaccineReminders;
use App\Jobs\SendWeatherAlerts;
use App\Jobs\SendWeeklyFarmSummary;
use App\Jobs\SyncDamMarketPrices;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Register Scheduled Jobs on Queue
Schedule::job(new SendVaccineReminders)->dailyAt('08:00');
Schedule::job(new SendWeatherAlerts)->dailyAt('08:00');
Schedule::job(new RetryFailedOfflineDiseaseAnalyses)->dailyAt('08:00');
Schedule::job(new SyncDamMarketPrices)->dailyAt('09:00');
Schedule::job(new RefreshWeatherCache)->hourly();
Schedule::job(new RetryOfflineSyncQueue)->hourly();
Schedule::job(new SendWeeklyFarmSummary)->weeklyOn(1, '10:00');
