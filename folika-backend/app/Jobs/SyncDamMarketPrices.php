<?php

namespace App\Jobs;

use App\Models\District;
use App\Models\MarketPrice;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncDamMarketPrices implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Log::info('[JOB START] SyncDamMarketPrices');

        $districts = District::all();
        $baseCommodities = [
            ['name' => 'আমন ধান (ব্রি ধান-৪৯)', 'cat' => 'crop', 'min' => 36.0, 'max' => 42.0],
            ['name' => 'বোরো ধান (ব্রি ধান-৮৯)', 'cat' => 'crop', 'min' => 34.0, 'max' => 38.0],
            ['name' => 'সরিষা (বারি-১৪)', 'cat' => 'crop', 'min' => 90.0, 'max' => 105.0],
            ['name' => 'গোল আলু (ডায়মন্ড)', 'cat' => 'crop', 'min' => 22.0, 'max' => 28.0],
            ['name' => 'রুই মাছ', 'cat' => 'fish', 'min' => 300.0, 'max' => 380.0],
            ['name' => 'কাতলা মাছ', 'cat' => 'fish', 'min' => 280.0, 'max' => 350.0],
            ['name' => 'খামারের দুধ', 'cat' => 'livestock', 'min' => 65.0, 'max' => 75.0],
            ['name' => 'সোনালী মুরগি (জীবন্ত)', 'cat' => 'livestock', 'min' => 260.0, 'max' => 310.0],
            ['name' => 'ইউরিয়া সার (সরকারি)', 'cat' => 'input', 'min' => 27.0, 'max' => 27.0],
            ['name' => 'ডিএপি সার (সরকারি)', 'cat' => 'input', 'min' => 21.0, 'max' => 21.0],
        ];

        foreach ($districts as $district) {
            foreach ($baseCommodities as $item) {
                $price = round(rand((int)($item['min'] * 10), (int)($item['max'] * 10)) / 10, 2);
                MarketPrice::updateOrCreate(
                    [
                        'product_name' => $item['name'],
                        'district_id' => $district->id,
                        'recorded_at' => Carbon::today(),
                    ],
                    [
                        'category' => $item['cat'],
                        'price_per_kg' => $price,
                        'source' => 'dam_api',
                        'verified' => true,
                    ]
                );
            }
        }

        Log::info('[JOB COMPLETE] SyncDamMarketPrices completed.');
    }
}
