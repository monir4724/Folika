<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LivestockBreedsMasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $breeds = [
            [
                'id' => 1,
                'animal_type' => 'cow',
                'breed_name' => 'হোলস্টেইন ফ্রিজিয়ান ক্রস (Holstein Friesian Cross)',
                'purpose' => 'milk',
                'origin' => 'নেদারল্যান্ডস / বাংলাদেশ কৃত্রিম প্রজনন',
                'description' => 'উচ্চ দুধ উৎপাদনশীল জাত। দৈনিক গড়ে ১৫-২৫ লিটার দুধ দেয়। সুষম দানাদার খাদ্য ও ঠান্ডা পরিবেশ প্রয়োজন।',
                'image_url' => 'assets/images/livestock/friesian.jpg',
            ],
            [
                'id' => 2,
                'animal_type' => 'cow',
                'breed_name' => 'শাহিওয়াল ক্রস (Sahiwal Cross)',
                'purpose' => 'dual',
                'origin' => 'পাকিস্তান / ভারত',
                'description' => 'উষ্ণ আবহাওয়া ও রোগ প্রতিরোধী জাত। দুধ ও মাংস উভয়ের জন্য উপযুক্ত। দুধের ফ্যাট বেশি (৪.৫%-৫%)।',
                'image_url' => 'assets/images/livestock/sahiwal.jpg',
            ],
            [
                'id' => 3,
                'animal_type' => 'cow',
                'breed_name' => 'রেড চিটাগাং ক্যাটেল - আরসিসি (Red Chittagong Cattle)',
                'purpose' => 'dual',
                'origin' => 'চট্টগ্রাম, বাংলাদেশ',
                'description' => 'দেশি উন্নত জাত। রোগ প্রতিরোধ ক্ষমতা অসাধারণ, কম খরচে লালন-পালন সম্ভব। মাংস সুস্বাদু ও পুষ্টিকর।',
                'image_url' => 'assets/images/livestock/rcc.jpg',
            ],
            [
                'id' => 4,
                'animal_type' => 'cow',
                'breed_name' => 'ব্রাহমা ক্রস ষাঁড় (Brahman Cross Bull)',
                'purpose' => 'meat',
                'origin' => 'আমেরিকা / বাংলাদেশ প্রাণিসম্পদ অধিদপ্তর',
                'description' => 'দ্রুত বর্ধনশীল জাত। কোরবানি বা বাণিজ্যিক মোটাতাজাকরণে ৯-১২ মাসে ৪০০-৫০০ কেজি ওজন অর্জন করে।',
                'image_url' => 'assets/images/livestock/brahman.jpg',
            ],
            [
                'id' => 5,
                'animal_type' => 'goat',
                'breed_name' => 'ব্ল্যাক বেঙ্গল ছাগল (Black Bengal Goat)',
                'purpose' => 'meat',
                'origin' => 'বাংলাদেশ',
                'description' => 'আন্তর্জাতিকভাবে সমাদৃত জাত। বছরে ২ বার বাচ্চা দেয় (২-৩টি বাচ্চা)। অত্যন্ত সুস্বাদু মাংস ও উচ্চমূল্যের চামড়া।',
                'image_url' => 'assets/images/livestock/black_bengal.jpg',
            ],
            [
                'id' => 6,
                'animal_type' => 'chicken',
                'breed_name' => 'সোনালী মুরগি (Sonali Chicken)',
                'purpose' => 'meat',
                'origin' => 'বাংলাদেশ (রোড আইল্যান্ড রেড × ফাউমি)',
                'description' => 'দেশি মুরগির মতো স্বাদ ও চেহারা। ৬০-৭০ দিনে ৮০০-১০০০ গ্রাম ওজনে পৌঁছে। রোগবালাই কম।',
                'image_url' => 'assets/images/livestock/sonali.jpg',
            ],
            [
                'id' => 7,
                'animal_type' => 'duck',
                'breed_name' => 'খাকি ক্যাম্পবেল হাঁস (Khaki Campbell)',
                'purpose' => 'egg',
                'origin' => 'যুক্তরাজ্য',
                'description' => 'বছরে ২৮০-৩০০টি ডিম দেয়। খামারে বা আবদ্ধ পদ্ধতিতে জল ছাড়াই সফলভাবে পালন করা যায়।',
                'image_url' => 'assets/images/livestock/duck.jpg',
            ],
        ];

        DB::table('livestock_breeds_master')->upsert($breeds, ['id'], [
            'animal_type', 'breed_name', 'purpose', 'origin', 'description', 'image_url'
        ]);
    }
}
