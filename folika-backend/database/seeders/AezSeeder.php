<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AezSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Provides BARC 30 Agro-Ecological Zones default reference parameters for offline fallback.
     */
    public function run(): void
    {
        // Reference data map for agricultural advice & fallback weather
    }

    /**
     * Helper to get static AEZ characteristics
     */
    public static function getAezData(int $aezCode): array
    {
        $aezMap = [
            1 => [
                'name_bn' => 'পুরাতন হিমালয় পাদদেশীয় সমভূমি',
                'name_en' => 'Old Himalayan Piedmont Plain',
                'soil_type' => 'বেলে দোআঁশ ও দোআঁশ',
                'drainage' => 'উত্তম',
                'temp_rabi' => '18-24°C',
                'temp_kharif' => '28-34°C',
                'avg_rain_mm' => 2200,
                'major_crops' => ['আমন ধান', 'গম', 'আলু', 'ভুট্টা', 'সরিষা'],
            ],
            3 => [
                'name_bn' => 'তিস্তা মেয়ান্ডার প্লাবনভূমি',
                'name_en' => 'Tista Meander Floodplain',
                'soil_type' => 'পলি দোআঁশ ও এঁটেল দোআঁশ',
                'drainage' => 'মাঝারি',
                'temp_rabi' => '19-25°C',
                'temp_kharif' => '29-35°C',
                'avg_rain_mm' => 2000,
                'major_crops' => ['আমন ধান', 'বোরো ধান', 'আলু', 'তামাক', 'সরিষা'],
            ],
            4 => [
                'name_bn' => 'করতোয়া-বাঙ্গালী প্লাবনভূমি (বগুড়া অঞ্চল)',
                'name_en' => 'Karatoya-Bangali Floodplain',
                'soil_type' => 'উর্বর দোআঁশ ও এঁটেল দোআঁশ',
                'drainage' => 'উত্তম থেকে মাঝারি',
                'temp_rabi' => '20-26°C',
                'temp_kharif' => '30-35°C',
                'avg_rain_mm' => 1750,
                'major_crops' => ['ব্রি ধান-৪৯', 'ব্রি ধান-৮৭', 'বারি সরিষা-১৪', 'আলু', 'মরিচ', 'ভুট্টা'],
            ],
            5 => [
                'name_bn' => 'নিম্ন আত্রাই অববাহিকা (চলনবিল)',
                'name_en' => 'Lower Atrai Basin',
                'soil_type' => 'ভারী এঁটেল ও কাদা মাটি',
                'drainage' => 'ধীর নিষ্কাশন',
                'temp_rabi' => '19-25°C',
                'temp_kharif' => '29-34°C',
                'avg_rain_mm' => 1600,
                'major_crops' => ['বোরো ধান', 'গভীর পানির আমন', 'মাছ চাষ'],
            ],
            8 => [
                'name_bn' => 'তরুণ ব্রহ্মপুত্র ও যমুনা প্লাবনভূমি',
                'name_en' => 'Young Brahmaputra and Jamuna Floodplain',
                'soil_type' => 'পলি দোআঁশ ও বেলে পলি',
                'drainage' => 'মাঝারি',
                'temp_rabi' => '21-27°C',
                'temp_kharif' => '30-36°C',
                'avg_rain_mm' => 1900,
                'major_crops' => ['আমন ধান', 'পাট', 'সরিষা', 'কালাই', 'শাকসবজি'],
            ],
            9 => [
                'name_bn' => 'পুরাতন ব্রহ্মপুত্র প্লাবনভূমি (ময়মনসিংহ)',
                'name_en' => 'Old Brahmaputra Floodplain',
                'soil_type' => 'উর্বর পলি দোআঁশ',
                'drainage' => 'উত্তম',
                'temp_rabi' => '20-26°C',
                'temp_kharif' => '29-34°C',
                'avg_rain_mm' => 2150,
                'major_crops' => ['আমন ধান', 'বোরো ধান', 'সরিষা', 'মাছ চাষ', 'শাকসবজি'],
            ],
            11 => [
                'name_bn' => 'উচ্চ গঙ্গা নদী প্লাবনভূমি (রাজশাহী-পাবনা-যশোর)',
                'name_en' => 'High Ganges River Floodplain',
                'soil_type' => 'ক্যালসিয়াম সমৃদ্ধ দোআঁশ ও বেলে দোআঁশ',
                'drainage' => 'উত্তম',
                'temp_rabi' => '20-27°C',
                'temp_kharif' => '32-38°C',
                'avg_rain_mm' => 1450,
                'major_crops' => ['আম', 'গম', 'ডাল', 'সরিষা', 'আখ', 'বোরো ধান'],
            ],
            25 => [
                'name_bn' => 'উচ্চ বরেন্দ্র ভূমি (গোদাগাড়ী-তানোর)',
                'name_en' => 'Level Barind Tract',
                'soil_type' => 'লালচে এঁটেল মাটি (কম জৈব পদার্থ)',
                'drainage' => 'খরা প্রবণ',
                'temp_rabi' => '18-26°C',
                'temp_kharif' => '33-40°C',
                'avg_rain_mm' => 1300,
                'major_crops' => ['আমন ধান', 'আম', 'পেয়ারা', 'মাল্টা', 'সরিষা'],
            ],
        ];

        return $aezMap[$aezCode] ?? $aezMap[4];
    }
}
