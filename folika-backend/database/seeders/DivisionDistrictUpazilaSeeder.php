<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DivisionDistrictUpazilaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            ['id' => 1, 'name_bn' => 'ঢাকা', 'name_en' => 'Dhaka'],
            ['id' => 2, 'name_bn' => 'রাজশাহী', 'name_en' => 'Rajshahi'],
            ['id' => 3, 'name_bn' => 'চট্টগ্রাম', 'name_en' => 'Chittagong'],
            ['id' => 4, 'name_bn' => 'খুলনা', 'name_en' => 'Khulna'],
            ['id' => 5, 'name_bn' => 'বরিশাল', 'name_en' => 'Barisal'],
            ['id' => 6, 'name_bn' => 'সিলেট', 'name_en' => 'Sylhet'],
            ['id' => 7, 'name_bn' => 'রংপুর', 'name_en' => 'Rangpur'],
            ['id' => 8, 'name_bn' => 'ময়মনসিংহ', 'name_en' => 'Mymensingh'],
        ];

        DB::table('divisions')->upsert($divisions, ['id'], ['name_bn', 'name_en']);

        $districts = [
            // Rajshahi
            ['id' => 1, 'division_id' => 2, 'name_bn' => 'বগুড়া', 'name_en' => 'Bogra'],
            ['id' => 2, 'division_id' => 2, 'name_bn' => 'রাজশাহী', 'name_en' => 'Rajshahi'],
            ['id' => 3, 'division_id' => 2, 'name_bn' => 'পাবনা', 'name_en' => 'Pabna'],
            ['id' => 4, 'division_id' => 2, 'name_bn' => 'সিরাজগঞ্জ', 'name_en' => 'Sirajganj'],
            ['id' => 5, 'division_id' => 2, 'name_bn' => 'নাটোর', 'name_en' => 'Natore'],
            ['id' => 6, 'division_id' => 2, 'name_bn' => 'নওগাঁ', 'name_en' => 'Naogaon'],
            ['id' => 7, 'division_id' => 2, 'name_bn' => 'জয়পুরহাট', 'name_en' => 'Joypurhat'],
            ['id' => 8, 'division_id' => 2, 'name_bn' => 'চাঁপাইনবাবগঞ্জ', 'name_en' => 'Chapai Nawabganj'],

            // Dhaka
            ['id' => 9, 'division_id' => 1, 'name_bn' => 'ঢাকা', 'name_en' => 'Dhaka'],
            ['id' => 10, 'division_id' => 1, 'name_bn' => 'গাজীপুর', 'name_en' => 'Gazipur'],
            ['id' => 11, 'division_id' => 1, 'name_bn' => 'নারায়ণগঞ্জ', 'name_en' => 'Narayanganj'],
            ['id' => 12, 'division_id' => 1, 'name_bn' => 'টাঙ্গাইল', 'name_en' => 'Tangail'],
            ['id' => 13, 'division_id' => 1, 'name_bn' => 'মানিকগঞ্জ', 'name_en' => 'Manikganj'],

            // Mymensingh
            ['id' => 14, 'division_id' => 8, 'name_bn' => 'ময়মনসিংহ', 'name_en' => 'Mymensingh'],
            ['id' => 15, 'division_id' => 8, 'name_bn' => 'জামালপুর', 'name_en' => 'Jamalpur'],
            ['id' => 16, 'division_id' => 8, 'name_bn' => 'শেরপুর', 'name_en' => 'Sherpur'],
            ['id' => 17, 'division_id' => 8, 'name_bn' => 'নেত্রকোণা', 'name_en' => 'Netrokona'],

            // Rangpur
            ['id' => 18, 'division_id' => 7, 'name_bn' => 'রংপুর', 'name_en' => 'Rangpur'],
            ['id' => 19, 'division_id' => 7, 'name_bn' => 'দিনাজপুর', 'name_en' => 'Dinajpur'],
            ['id' => 20, 'division_id' => 7, 'name_bn' => 'কুড়িগ্রাম', 'name_en' => 'Kurigram'],

            // Chittagong
            ['id' => 21, 'division_id' => 3, 'name_bn' => 'চট্টগ্রাম', 'name_en' => 'Chittagong'],
            ['id' => 22, 'division_id' => 3, 'name_bn' => 'কুমিল্লা', 'name_en' => 'Comilla'],
            ['id' => 23, 'division_id' => 3, 'name_bn' => 'চাঁদপুর', 'name_en' => 'Chandpur'],

            // Khulna
            ['id' => 24, 'division_id' => 4, 'name_bn' => 'খুলনা', 'name_en' => 'Khulna'],
            ['id' => 25, 'division_id' => 4, 'name_bn' => 'যশোর', 'name_en' => 'Jessore'],

            // Barisal
            ['id' => 26, 'division_id' => 5, 'name_bn' => 'বরিশাল', 'name_en' => 'Barisal'],

            // Sylhet
            ['id' => 27, 'division_id' => 6, 'name_bn' => 'সিলেট', 'name_en' => 'Sylhet'],
        ];

        DB::table('districts')->upsert($districts, ['id'], ['division_id', 'name_bn', 'name_en']);

        $upazilas = [
            // Bogra (District ID: 1)
            ['id' => 1, 'district_id' => 1, 'name_bn' => 'শেরপুর', 'name_en' => 'Sherpur', 'aez_code' => 4],
            ['id' => 2, 'district_id' => 1, 'name_bn' => 'বগুড়া সদর', 'name_en' => 'Bogra Sadar', 'aez_code' => 4],
            ['id' => 3, 'district_id' => 1, 'name_bn' => 'শিবগঞ্জ', 'name_en' => 'Shibganj', 'aez_code' => 3],
            ['id' => 4, 'district_id' => 1, 'name_bn' => 'ধুনট', 'name_en' => 'Dhunat', 'aez_code' => 4],
            ['id' => 5, 'district_id' => 1, 'name_bn' => 'শাজাহানপুর', 'name_en' => 'Shajahanpur', 'aez_code' => 4],
            ['id' => 6, 'district_id' => 1, 'name_bn' => 'গাবতলী', 'name_en' => 'Gabtali', 'aez_code' => 4],
            ['id' => 7, 'district_id' => 1, 'name_bn' => 'কাহালু', 'name_en' => 'Kahalu', 'aez_code' => 3],
            ['id' => 8, 'district_id' => 1, 'name_bn' => 'নন্দীগ্রাম', 'name_en' => 'Nandigram', 'aez_code' => 5],

            // Rajshahi (District ID: 2)
            ['id' => 9, 'district_id' => 2, 'name_bn' => 'গোদাগাড়ী', 'name_en' => 'Godagari', 'aez_code' => 25],
            ['id' => 10, 'district_id' => 2, 'name_bn' => 'পবা', 'name_en' => 'Paba', 'aez_code' => 11],
            ['id' => 11, 'district_id' => 2, 'name_bn' => 'বাগমারা', 'name_en' => 'Bagmara', 'aez_code' => 5],

            // Pabna (District ID: 3)
            ['id' => 12, 'district_id' => 3, 'name_bn' => 'সাঁথিয়া', 'name_en' => 'Santhia', 'aez_code' => 11],
            ['id' => 13, 'district_id' => 3, 'name_bn' => 'ঈশ্বরদী', 'name_en' => 'Ishwardi', 'aez_code' => 11],

            // Sirajganj (District ID: 4)
            ['id' => 14, 'district_id' => 4, 'name_bn' => 'শাহজাদপুর', 'name_en' => 'Shahjadpur', 'aez_code' => 7],
            ['id' => 15, 'district_id' => 4, 'name_bn' => 'উল্লাপাড়া', 'name_en' => 'Ullapara', 'aez_code' => 7],

            // Dhaka (District ID: 9)
            ['id' => 16, 'district_id' => 9, 'name_bn' => 'ধামরাই', 'name_en' => 'Dhamrai', 'aez_code' => 8],
            ['id' => 17, 'district_id' => 9, 'name_bn' => 'সাভার', 'name_en' => 'Savar', 'aez_code' => 8],
            ['id' => 18, 'district_id' => 9, 'name_bn' => 'কেরানীগঞ্জ', 'name_en' => 'Keraniganj', 'aez_code' => 8],
            ['id' => 32, 'district_id' => 9, 'name_bn' => 'সূত্রাপুর', 'name_en' => 'Sutrapur', 'aez_code' => 8],
            ['id' => 33, 'district_id' => 9, 'name_bn' => 'কোতোয়ালি', 'name_en' => 'Kotwali', 'aez_code' => 8],
            ['id' => 34, 'district_id' => 9, 'name_bn' => 'লালবাগ', 'name_en' => 'Lalbagh', 'aez_code' => 8],
            ['id' => 35, 'district_id' => 9, 'name_bn' => 'তেজগাঁও', 'name_en' => 'Tejgaon', 'aez_code' => 8],
            ['id' => 36, 'district_id' => 9, 'name_bn' => 'মতিঝিল', 'name_en' => 'Motijheel', 'aez_code' => 8],
            ['id' => 37, 'district_id' => 9, 'name_bn' => 'রমনা', 'name_en' => 'Ramna', 'aez_code' => 8],
            ['id' => 38, 'district_id' => 9, 'name_bn' => 'ধানমন্ডি', 'name_en' => 'Dhanmondi', 'aez_code' => 8],
            ['id' => 39, 'district_id' => 9, 'name_bn' => 'মোহাম্মদপুর', 'name_en' => 'Mohammadpur', 'aez_code' => 8],
            ['id' => 40, 'district_id' => 9, 'name_bn' => 'গুলশান', 'name_en' => 'Gulshan', 'aez_code' => 8],
            ['id' => 41, 'district_id' => 9, 'name_bn' => 'মিরপুর', 'name_en' => 'Mirpur', 'aez_code' => 8],
            ['id' => 42, 'district_id' => 9, 'name_bn' => 'উত্তরা', 'name_en' => 'Uttara', 'aez_code' => 8],

            // Mymensingh (District ID: 14)
            ['id' => 19, 'district_id' => 14, 'name_bn' => 'মুক্তাগাছা', 'name_en' => 'Muktagachha', 'aez_code' => 9],
            ['id' => 20, 'district_id' => 14, 'name_bn' => 'ময়মনসিংহ সদর', 'name_en' => 'Mymensingh Sadar', 'aez_code' => 9],
            ['id' => 21, 'district_id' => 14, 'name_bn' => 'ত্রিশাল', 'name_en' => 'Trishal', 'aez_code' => 9],

            // Dinajpur (District ID: 19)
            ['id' => 22, 'district_id' => 19, 'name_bn' => 'বিরল', 'name_en' => 'Biral', 'aez_code' => 1],
            ['id' => 23, 'district_id' => 19, 'name_bn' => 'দিনাজপুর সদর', 'name_en' => 'Dinajpur Sadar', 'aez_code' => 1],

            // Jessore (District ID: 25)
            ['id' => 24, 'district_id' => 25, 'name_bn' => 'মণিরামপুর', 'name_en' => 'Manirampur', 'aez_code' => 11],
            ['id' => 25, 'district_id' => 25, 'name_bn' => 'অভয়নগর', 'name_en' => 'Abhaynagar', 'aez_code' => 11],

            // Comilla (District ID: 22)
            ['id' => 26, 'district_id' => 22, 'name_bn' => 'কুমিল্লা আদর্শ সদর', 'name_en' => 'Comilla Sadar', 'aez_code' => 19],

            // Chandpur (District ID: 23)
            ['id' => 27, 'district_id' => 23, 'name_bn' => 'মতলব উত্তর', 'name_en' => 'Matlab North', 'aez_code' => 19],

            // Gazipur (District ID: 10)
            ['id' => 28, 'district_id' => 10, 'name_bn' => 'কালিয়াকৈর', 'name_en' => 'Kaliakair', 'aez_code' => 8],
            ['id' => 29, 'district_id' => 10, 'name_bn' => 'গাজীপুর সদর', 'name_en' => 'Gazipur Sadar', 'aez_code' => 8],
            ['id' => 30, 'district_id' => 10, 'name_bn' => 'কাপাসিয়া', 'name_en' => 'Kapasia', 'aez_code' => 8],
            ['id' => 31, 'district_id' => 10, 'name_bn' => 'শ্রীপুর', 'name_en' => 'Sreepur', 'aez_code' => 8],
        ];

        DB::table('upazilas')->upsert($upazilas, ['id'], ['district_id', 'name_bn', 'name_en', 'aez_code']);
    }
}
