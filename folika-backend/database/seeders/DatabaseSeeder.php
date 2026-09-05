<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DivisionDistrictUpazilaSeeder::class,
            AezSeeder::class,
            CropsMasterSeeder::class,
            FishSpeciesMasterSeeder::class,
            LivestockBreedsMasterSeeder::class,
            KaliakoirDealersSeeder::class,
        ]);

        // 1. Seed Super Admin
        DB::table('admins')->upsert([
            [
                'id' => 1,
                'name' => 'সুপার অ্যাডমিন (Super Admin)',
                'email' => 'admin@folika.gov.bd',
                'password_hash' => Hash::make('Admin@Folika2026'),
                'admin_level' => 'super_admin',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'কন্টেন্ট ম্যানেজার (Content Manager)',
                'email' => 'content@folika.gov.bd',
                'password_hash' => Hash::make('Content@Folika2026'),
                'admin_level' => 'content_manager',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['id'], ['name', 'email', 'password_hash', 'admin_level', 'is_active']);

        // 2. Seed Demo Farmer User (Matches Screenshot: মোঃ মনিরুজ্জামান, শেরপুর, বগুড়া)
        DB::table('users')->upsert([
            [
                'id' => 1,
                'name' => 'Rohim mia',
                'mobile' => '01711111111',
                'email' => 'monir@folika.gov.bd',
                'password_hash' => Hash::make('Farmer@123'),
                'role' => 'farmer',
                'farm_type' => 'mixed',
                'division_id' => 2, // Rajshahi
                'district_id' => 1, // Bogra
                'upazila_id' => 1,  // Sherpur
                'aez_code' => 4,
                'latitude' => 24.67380000,
                'longitude' => 89.41840000,
                'language' => 'bn',
                'is_active' => true,
                'is_verified' => true,
                'notify_push' => true,
                'notify_sms' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'মোঃ তোফাজ্জল হোসেন (ডিলার)',
                'mobile' => '01802252697',
                'email' => 'tofazzal@dealer.folika.bd',
                'password_hash' => Hash::make('Dealer@123'),
                'role' => 'dealer',
                'farm_type' => null,
                'division_id' => 1, // Dhaka
                'district_id' => 10, // Gazipur
                'upazila_id' => 28, // Kaliakair
                'aez_code' => 8,
                'latitude' => 24.07000000,
                'longitude' => 90.22000000,
                'language' => 'bn',
                'is_active' => true,
                'is_verified' => true,
                'notify_push' => true,
                'notify_sms' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'কৃষিবিদ সারোয়ার হোসেন (উপজেলা কৃষি কর্মকর্তা)',
                'mobile' => '01933333333',
                'email' => 'uao.sherpur@dae.gov.bd',
                'password_hash' => Hash::make('Officer@123'),
                'role' => 'extension_officer',
                'farm_type' => null,
                'division_id' => 2,
                'district_id' => 1,
                'upazila_id' => 1,
                'aez_code' => 4,
                'latitude' => 24.67000000,
                'longitude' => 89.41500000,
                'language' => 'bn',
                'is_active' => true,
                'is_verified' => true,
                'notify_push' => true,
                'notify_sms' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['id'], [
            'name', 'mobile', 'email', 'password_hash', 'role', 'farm_type',
            'division_id', 'district_id', 'upazila_id', 'aez_code',
            'latitude', 'longitude', 'language', 'is_active', 'is_verified',
            'notify_push', 'notify_sms'
        ]);

        // 3. Seed Verified Dealer Shop
        DB::table('dealers')->upsert([
            [
                'id' => 1,
                'user_id' => 2,
                'shop_name' => 'মা ভেড়া পোল্ট্রি ফার্ম',
                'shop_type' => 'general',
                'address' => 'ঢালজোড়া, কালিয়াকৈর, গাজীপুর',
                'upazila_id' => 28,
                'phone' => '01802252697',
                'avg_rating' => 4.85,
                'review_count' => 24,
                'is_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['id'], ['user_id', 'shop_name', 'shop_type', 'address', 'upazila_id', 'phone', 'avg_rating', 'review_count', 'is_verified']);

        // 4. Seed Sample Market Prices
        $prices = [
            [
                'id' => 1,
                'product_name' => 'আমন ধান (ব্রি ধান-৪৯)',
                'category' => 'crop',
                'district_id' => 1, // Bogra
                'price_per_kg' => 38.50,
                'source' => 'admin_verified',
                'submitted_by' => 3,
                'verified' => true,
                'recorded_at' => Carbon::today(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'product_name' => 'সরিষা (বারি-১৪)',
                'category' => 'crop',
                'district_id' => 1,
                'price_per_kg' => 95.00,
                'source' => 'admin_verified',
                'submitted_by' => 3,
                'verified' => true,
                'recorded_at' => Carbon::today(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'product_name' => 'রুই মাছ (বড় আকার)',
                'category' => 'fish',
                'district_id' => 1,
                'price_per_kg' => 340.00,
                'source' => 'dam_api',
                'submitted_by' => null,
                'verified' => true,
                'recorded_at' => Carbon::today(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'product_name' => 'খামারের তরল দুধ',
                'category' => 'livestock',
                'district_id' => 1,
                'price_per_kg' => 70.00,
                'source' => 'community',
                'submitted_by' => 1,
                'verified' => true,
                'recorded_at' => Carbon::today(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'product_name' => 'ইউরিয়া সার (BCIC সরকারি দর)',
                'category' => 'input',
                'district_id' => 1,
                'price_per_kg' => 27.00,
                'source' => 'admin_verified',
                'submitted_by' => 3,
                'verified' => true,
                'recorded_at' => Carbon::today(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('market_prices')->upsert($prices, ['id'], [
            'product_name', 'category', 'district_id', 'price_per_kg', 'source', 'submitted_by', 'verified', 'recorded_at'
        ]);

        // 5. Seed Official Notice / Forum Post
        DB::table('forum_posts')->upsert([
            [
                'id' => 1,
                'user_id' => 3,
                'category' => 'official_notice',
                'title' => 'শেরপুর উপজেলায় বোরো ধান চাষ ও সার বিতরণ সংক্রান্ত সরকারি নির্দেশনা',
                'body' => 'উপজেলার সকল কৃষক ভাইদের জানানো যাচ্ছে যে, অনুমোদিত ডিলারের নিকট হতে নির্ধারিত সরকারি মূল্যে ইউরিয়া ও ডিএপি সার সংগ্রহ করুন। কোনো অতিরিক্ত দাম দাবি করলে অবিলম্বে উপজেলা কৃষি অফিসে যোগাযোগ করুন।',
                'is_official' => true,
                'is_pinned' => true,
                'upvotes' => 42,
                'downvotes' => 1,
                'reply_count' => 2,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'category' => 'crop',
                'title' => 'আমন ধানে পাতা পোড়া রোগের তাৎক্ষণিক প্রতিকার কী?',
                'body' => 'আমার ৩ বিঘা জমির আমন ধানের পাতায় বাদামি দাগ দেখা দিয়েছে। অভিজ্ঞ কৃষক ভাইদের পরামর্শ চাই।',
                'is_official' => false,
                'is_pinned' => false,
                'upvotes' => 15,
                'downvotes' => 0,
                'reply_count' => 1,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ], ['id'], ['user_id', 'category', 'title', 'body', 'is_official', 'is_pinned', 'upvotes', 'downvotes', 'reply_count', 'status']);
    }
}
