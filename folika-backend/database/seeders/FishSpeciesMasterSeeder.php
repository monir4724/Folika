<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FishSpeciesMasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $species = [
            // Surface Layer (উপরিভাগ)
            [
                'id' => 1,
                'name_bn' => 'কাতলা (Gibelion catla)',
                'name_en' => 'Catla (Surface Feeder / Zooplankton)',
                'water_layer' => 'surface',
                'min_depth_m' => 1.5,
                'growth_months' => 12,
                'avg_weight_kg' => 2.0,
                'avg_price_per_kg' => 320.00,
                'feed_rate_pct' => 2.5,
                'disease_risk' => 'low',
                'suitable_aez' => json_encode([1, 2, 3, 4, 5, 8, 9, 11, 14, 19]),
                'image_url' => 'assets/images/fish/catla.jpg',
            ],
            [
                'id' => 2,
                'name_bn' => 'সিলভার কার্প (Hypophthalmichthys molitrix)',
                'name_en' => 'Silver Carp (Phytoplankton Feeder)',
                'water_layer' => 'surface',
                'min_depth_m' => 1.2,
                'growth_months' => 8,
                'avg_weight_kg' => 1.5,
                'avg_price_per_kg' => 160.00,
                'feed_rate_pct' => 2.0,
                'disease_risk' => 'low',
                'suitable_aez' => json_encode([1, 2, 3, 4, 5, 8, 9, 11, 14, 19]),
                'image_url' => 'assets/images/fish/silver_carp.jpg',
            ],
            [
                'id' => 3,
                'name_bn' => 'বিগহেড কার্প (Hypophthalmichthys nobilis)',
                'name_en' => 'Bighead Carp',
                'water_layer' => 'surface',
                'min_depth_m' => 1.5,
                'growth_months' => 10,
                'avg_weight_kg' => 2.5,
                'avg_price_per_kg' => 200.00,
                'feed_rate_pct' => 2.5,
                'disease_risk' => 'low',
                'suitable_aez' => json_encode([1, 3, 4, 8, 9, 11]),
                'image_url' => 'assets/images/fish/bighead.jpg',
            ],

            // Middle Layer (মধ্যস্তর)
            [
                'id' => 4,
                'name_bn' => 'রুই (Labeo rohita)',
                'name_en' => 'Rui / Rohu (Column Feeder)',
                'water_layer' => 'middle',
                'min_depth_m' => 1.5,
                'growth_months' => 12,
                'avg_weight_kg' => 1.8,
                'avg_price_per_kg' => 350.00,
                'feed_rate_pct' => 3.0,
                'disease_risk' => 'medium',
                'suitable_aez' => json_encode([1, 2, 3, 4, 5, 8, 9, 11, 14, 19]),
                'image_url' => 'assets/images/fish/rui.jpg',
            ],
            [
                'id' => 5,
                'name_bn' => 'গ্রাস কার্প (Ctenopharyngodon idella)',
                'name_en' => 'Grass Carp (Aquatic Weed Controller)',
                'water_layer' => 'middle',
                'min_depth_m' => 1.5,
                'growth_months' => 10,
                'avg_weight_kg' => 2.2,
                'avg_price_per_kg' => 220.00,
                'feed_rate_pct' => 5.0,
                'disease_risk' => 'low',
                'suitable_aez' => json_encode([1, 3, 4, 8, 9, 11, 19]),
                'image_url' => 'assets/images/fish/grass_carp.jpg',
            ],

            // Bottom Layer (তলদেশ)
            [
                'id' => 6,
                'name_bn' => 'মৃগেল (Cirrhinus mrigala)',
                'name_en' => 'Mrigel (Bottom Feeder / Detritivore)',
                'water_layer' => 'bottom',
                'min_depth_m' => 1.5,
                'growth_months' => 12,
                'avg_weight_kg' => 1.5,
                'avg_price_per_kg' => 280.00,
                'feed_rate_pct' => 2.5,
                'disease_risk' => 'low',
                'suitable_aez' => json_encode([1, 2, 3, 4, 5, 8, 9, 11, 14, 19]),
                'image_url' => 'assets/images/fish/mrigel.jpg',
            ],
            [
                'id' => 7,
                'name_bn' => 'কমন কার্প / কার্পিও (Cyprinus carpio)',
                'name_en' => 'Common Carp / Carpio',
                'water_layer' => 'bottom',
                'min_depth_m' => 1.5,
                'growth_months' => 10,
                'avg_weight_kg' => 2.0,
                'avg_price_per_kg' => 240.00,
                'feed_rate_pct' => 3.0,
                'disease_risk' => 'low',
                'suitable_aez' => json_encode([1, 3, 4, 8, 9, 11, 19]),
                'image_url' => 'assets/images/fish/carpio.jpg',
            ],
            [
                'id' => 8,
                'name_bn' => 'গলদা চিংড়ি (Macrobrachium rosenbergii)',
                'name_en' => 'Giant River Prawn (Galda)',
                'water_layer' => 'bottom',
                'min_depth_m' => 1.2,
                'growth_months' => 7,
                'avg_weight_kg' => 0.1,
                'avg_price_per_kg' => 850.00,
                'feed_rate_pct' => 4.0,
                'disease_risk' => 'medium',
                'suitable_aez' => json_encode([4, 8, 9, 11, 14, 19]),
                'image_url' => 'assets/images/fish/prawn.jpg',
            ],
            [
                'id' => 9,
                'name_bn' => 'পাবদা (Ompok pabda)',
                'name_en' => 'Pabda (High Value Indigenous Catfish)',
                'water_layer' => 'bottom',
                'min_depth_m' => 1.2,
                'growth_months' => 6,
                'avg_weight_kg' => 0.08,
                'avg_price_per_kg' => 450.00,
                'feed_rate_pct' => 5.0,
                'disease_risk' => 'medium',
                'suitable_aez' => json_encode([1, 3, 4, 8, 9, 11, 19]),
                'image_url' => 'assets/images/fish/pabda.jpg',
            ],
            [
                'id' => 10,
                'name_bn' => 'মনোসেক্স তেলাপিয়া (GIFT Tilapia)',
                'name_en' => 'Monosex GIFT Tilapia',
                'water_layer' => 'middle',
                'min_depth_m' => 1.0,
                'growth_months' => 5,
                'avg_weight_kg' => 0.4,
                'avg_price_per_kg' => 200.00,
                'feed_rate_pct' => 4.0,
                'disease_risk' => 'low',
                'suitable_aez' => json_encode([1, 2, 3, 4, 5, 8, 9, 11, 14, 19]),
                'image_url' => 'assets/images/fish/tilapia.jpg',
            ],
        ];

        DB::table('fish_species_master')->upsert($species, ['id'], [
            'name_bn', 'name_en', 'water_layer', 'min_depth_m', 'growth_months',
            'avg_weight_kg', 'avg_price_per_kg', 'feed_rate_pct', 'disease_risk',
            'suitable_aez', 'image_url'
        ]);
    }
}
