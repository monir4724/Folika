<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class FishAndLivestockTest extends TestCase
{
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        try {
            $this->user = User::firstOrCreate(
                ['mobile' => '01711111111'],
                ['name' => 'মোঃ মনিরুজ্জামান', 'role' => 'farmer', 'language' => 'bn', 'is_active' => true]
            );
        } catch (\Throwable $e) {
            $this->markTestSkipped('MySQL testing database is not available: ' . $e->getMessage());
        }
    }

    public function test_can_calculate_pond_layers(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/fish/calculate-layers', [
            'pond_depth_m' => 1.8,
            'pond_area_sqm' => 400.0,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.layer_count', 2);

        $deep = $this->actingAs($this->user, 'sanctum')->postJson('/api/fish/calculate-layers', [
            'pond_depth_ft' => 7,
            'pond_area_sqm' => 400.0,
        ]);
        $deep->assertStatus(200)->assertJsonPath('data.layer_count', 3);

        $shallow = $this->postJson('/api/fish/calculate-layers', [
            'pond_depth_ft' => 3,
            'pond_length_ft' => 100,
            'pond_width_ft' => 50,
        ]);
        $shallow->assertStatus(200)->assertJsonPath('data.layer_count', 1);
    }

    public function test_can_create_fish_plan_and_add_species(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/fish/plans', [
            'name' => 'মাছের পুকুর ১',
            'pond_length_m' => 20,
            'pond_width_m' => 15,
            'pond_depth_m' => 1.5,
            'culture_duration_months' => 12,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'মাছের পুকুর ১',
                    'pond_area_sqm' => 300.0,
                ]
            ]);

        $planId = $response->json('data.id');

        $speciesResp = $this->actingAs($this->user, 'sanctum')->postJson("/api/fish/plans/{$planId}/species", [
            'species_id' => 1, // Katla
            'water_layer' => 'surface',
            'quantity' => 100,
        ]);

        $speciesResp->assertStatus(201);
    }

    public function test_can_check_livestock_capacity_and_create_plan(): void
    {
        $capResp = $this->actingAs($this->user, 'sanctum')->postJson('/api/livestock/capacity-check', [
            'animal_type' => 'cow',
            'shed_area_sqm' => 40.0,
            'animal_count' => 8,
        ]);

        $capResp->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_overcrowded' => false,
                ]
            ]);

        $planResp = $this->actingAs($this->user, 'sanctum')->postJson('/api/livestock/plans', [
            'name' => 'ডেইরি শেড ১',
            'shed_length_m' => 10,
            'shed_width_m' => 4,
            'animal_type' => 'cow',
            'purpose' => 'milk',
            'animal_count' => 6,
        ]);

        $planResp->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'ডেইরি শেড ১',
                    'animal_count' => 6,
                ]
            ]);

        $planId = $planResp->json('data.id');

        // Check auto-generated vaccines
        $vaccines = $this->actingAs($this->user, 'sanctum')->getJson("/api/livestock/plans/{$planId}/vaccines");
        $vaccines->assertStatus(200)
            ->assertJsonCount(4, 'data');
    }
}
