<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CropsMasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $crops = [
            [
                'id' => 1,
                'name_bn' => 'ব্রি ধান-৪৯ (BRRI dhan49)',
                'name_en' => 'BRRI dhan49 (High Yielding Aman Rice)',
                'category' => 'grain',
                'suitable_aez' => json_encode([1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 19, 25]),
                'suitable_seasons' => json_encode(['kharif_2']),
                'avg_yield_per_bigha' => 18.5,
                'avg_price_per_kg' => 38.00,
                'image_url' => 'assets/images/crops/brri49.jpg',
            ],
            [
                'id' => 2,
                'name_bn' => 'ব্রি ধান-৮৭ (BRRI dhan87)',
                'name_en' => 'BRRI dhan87 (Premium Aman)',
                'category' => 'grain',
                'suitable_aez' => json_encode([1, 3, 4, 8, 9, 11, 19]),
                'suitable_seasons' => json_encode(['kharif_2']),
                'avg_yield_per_bigha' => 20.0,
                'avg_price_per_kg' => 44.00,
                'image_url' => 'assets/images/crops/brri87.jpg',
            ],
            [
                'id' => 3,
                'name_bn' => 'ব্রি ধান-৮৯ (BRRI dhan89)',
                'name_en' => 'BRRI dhan89 (Mega Yield Boro Rice)',
                'category' => 'grain',
                'suitable_aez' => json_encode([1, 3, 4, 5, 8, 9, 11, 14, 19]),
                'suitable_seasons' => json_encode(['rabi']),
                'avg_yield_per_bigha' => 28.0,
                'avg_price_per_kg' => 36.00,
                'image_url' => 'assets/images/crops/brri89.jpg',
            ],
            [
                'id' => 4,
                'name_bn' => 'বিনা ধান-৭ (BINA dhan-7)',
                'name_en' => 'BINA dhan-7 (Short Duration Early Aman)',
                'category' => 'grain',
                'suitable_aez' => json_encode([1, 3, 4, 9, 11, 25]),
                'suitable_seasons' => json_encode(['kharif_2']),
                'avg_yield_per_bigha' => 16.5,
                'avg_price_per_kg' => 39.00,
                'image_url' => 'assets/images/crops/bina7.jpg',
            ],
            [
                'id' => 5,
                'name_bn' => 'বারি সরিষা-১৪ (BARI Sarisha-14)',
                'name_en' => 'BARI Sarisha-14 (Short Duration 75-80 Days)',
                'category' => 'oilseed',
                'suitable_aez' => json_encode([1, 3, 4, 8, 9, 11, 19, 25]),
                'suitable_seasons' => json_encode(['rabi']),
                'avg_yield_per_bigha' => 5.5,
                'avg_price_per_kg' => 95.00,
                'image_url' => 'assets/images/crops/mustard14.jpg',
            ],
            [
                'id' => 6,
                'name_bn' => 'বারি সরিষা-১৭ (BARI Sarisha-17)',
                'name_en' => 'BARI Sarisha-17 (High Yielding Yellow Mustard)',
                'category' => 'oilseed',
                'suitable_aez' => json_encode([1, 3, 4, 8, 11, 19]),
                'suitable_seasons' => json_encode(['rabi']),
                'avg_yield_per_bigha' => 6.2,
                'avg_price_per_kg' => 100.00,
                'image_url' => 'assets/images/crops/mustard17.jpg',
            ],
            [
                'id' => 7,
                'name_bn' => 'ডায়মন্ড গোল আলু (Diamond Potato)',
                'name_en' => 'Diamond Potato (High Yielding Table Variety)',
                'category' => 'vegetable',
                'suitable_aez' => json_encode([1, 3, 4, 9, 11]),
                'suitable_seasons' => json_encode(['rabi']),
                'avg_yield_per_bigha' => 90.0,
                'avg_price_per_kg' => 25.00,
                'image_url' => 'assets/images/crops/potato.jpg',
            ],
            [
                'id' => 8,
                'name_bn' => 'হাইব্রিড ভুট্টা (Hybrid Maize)',
                'name_en' => 'Hybrid Maize (NK-40 / Pioneer)',
                'category' => 'grain',
                'suitable_aez' => json_encode([1, 3, 4, 8, 9, 11, 25]),
                'suitable_seasons' => json_encode(['rabi', 'kharif_1']),
                'avg_yield_per_bigha' => 38.0,
                'avg_price_per_kg' => 30.00,
                'image_url' => 'assets/images/crops/maize.jpg',
            ],
            [
                'id' => 9,
                'name_bn' => 'তোষা পাট (O-9897 Tossa Jute)',
                'name_en' => 'Tossa Jute O-9897',
                'category' => 'fiber',
                'suitable_aez' => json_encode([3, 4, 8, 9, 11]),
                'suitable_seasons' => json_encode(['kharif_1']),
                'avg_yield_per_bigha' => 11.0,
                'avg_price_per_kg' => 75.00,
                'image_url' => 'assets/images/crops/jute.jpg',
            ],
            [
                'id' => 10,
                'name_bn' => 'বারি মুগ-৬ (BARI Mung-6)',
                'name_en' => 'BARI Mung-6 (Summer Pulse / Nitrogen Fixer)',
                'category' => 'grain',
                'suitable_aez' => json_encode([1, 3, 4, 8, 9, 11, 19]),
                'suitable_seasons' => json_encode(['kharif_1', 'kharif_2']),
                'avg_yield_per_bigha' => 4.5,
                'avg_price_per_kg' => 110.00,
                'image_url' => 'assets/images/crops/mung.jpg',
            ],
        ];

        DB::table('crops_master')->upsert($crops, ['id'], [
            'name_bn', 'name_en', 'category', 'suitable_aez', 'suitable_seasons',
            'avg_yield_per_bigha', 'avg_price_per_kg', 'image_url'
        ]);
    }
}
