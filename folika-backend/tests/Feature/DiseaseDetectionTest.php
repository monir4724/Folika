<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DiseaseDetectionTest extends TestCase
{
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::firstOrCreate(
            ['mobile' => '01711111111'],
            ['name' => 'মোঃ মনিরুজ্জামান', 'role' => 'farmer', 'language' => 'bn', 'is_active' => true]
        );
    }

    public function test_can_analyze_disease_with_gemini_fallback(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->create('leaf_blast.jpg', 120, 'image/jpeg');

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/disease/analyze', [
            'category' => 'crop',
            'image' => $file,
            'symptoms' => [
                'পাতায় বাদামী দাগ',
                'শীষ শুকিয়ে যাওয়া'
            ]
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'category' => 'crop',
                    'status' => 'analyzed',
                ]
            ]);

        // Check history
        $history = $this->actingAs($this->user, 'sanctum')->getJson('/api/disease/history');
        $history->assertStatus(200)
            ->assertJson(['success' => true]);

        // Check nearby centers
        $centers = $this->actingAs($this->user, 'sanctum')->getJson('/api/disease/nearby-centers');
        $centers->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_can_process_offline_sync_batch(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/sync', [
            'queue' => [
                [
                    'client_id' => 'temp-crop-1',
                    'action_type' => 'create_crop_plan',
                    'created_at' => now()->toISOString(),
                    'payload' => [
                        'name' => 'অফলাইন গম প্ল্যান',
                        'land_shape' => 'rectangular',
                        'land_length_m' => 30,
                        'land_width_m' => 20,
                        'crop_id' => 2,
                        'season' => 'rabi',
                    ]
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'synced_count' => 1,
                'failed_count' => 0,
            ]);
    }

    public function test_can_fetch_weather_and_alerts(): void
    {
        $current = $this->actingAs($this->user, 'sanctum')->getJson('/api/weather/current');
        $current->assertStatus(200)->assertJson(['success' => true]);

        $forecast = $this->actingAs($this->user, 'sanctum')->getJson('/api/weather/forecast');
        $forecast->assertStatus(200)->assertJson(['success' => true]);

        $alerts = $this->actingAs($this->user, 'sanctum')->getJson('/api/weather/alerts');
        $alerts->assertStatus(200)->assertJson(['success' => true]);
    }
}
