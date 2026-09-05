<?php

namespace Tests\Feature;

use App\Models\CropPlan;
use App\Models\User;
use Tests\TestCase;

class CropPlanTest extends TestCase
{
    public function test_farmer_can_create_crop_plan_with_automatic_area_calculation(): void
    {
        $user = User::where('mobile', '01711111111')->first();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/crops/plans', [
            'name' => 'আমনের জমি ১',
            'land_shape' => 'rectangular',
            'land_length_m' => 40.0,
            'land_width_m' => 30.0,
            'crop_id' => 1, // BRRI dhan49
            'season' => 'kharif_2',
            'soil_type' => 'দোআঁশ',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'আমনের জমি ১',
                    'land_area_sqm' => 1200.0,
                ],
            ]);

        $planId = $response->json('data.id');

        // Add Cost Item
        $costResponse = $this->actingAs($user, 'sanctum')->postJson("/api/crops/plans/{$planId}/costs", [
            'item_type' => 'input',
            'item_name' => 'ইউরিয়া সার',
            'quantity' => 20,
            'unit' => 'কেজি',
            'unit_price' => 27.00,
        ]);

        $costResponse->assertStatus(201);

        // Add Revenue Item
        $revResponse = $this->actingAs($user, 'sanctum')->postJson("/api/crops/plans/{$planId}/revenues", [
            'item_name' => 'ধান বিক্রি',
            'quantity' => 100,
            'unit' => 'কেজি',
            'unit_price' => 38.00,
        ]);

        $revResponse->assertStatus(201);

        // Check plan detail and net profit generated column
        $detail = $this->actingAs($user, 'sanctum')->getJson("/api/crops/plans/{$planId}");
        $detail->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_cost' => 540.0,
                    'total_revenue' => 3800.0,
                    'net_profit' => 3260.0,
                ],
            ]);
    }
}
