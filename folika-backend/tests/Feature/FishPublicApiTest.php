<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FishPublicApiTest extends TestCase
{
    public function test_calculate_layers_without_login_or_database(): void
    {
        $this->postJson('/api/fish/calculate-layers', [
            'pond_depth_ft' => 3,
            'pond_length_ft' => 100,
            'pond_width_ft' => 50,
        ])->assertOk()->assertJsonPath('data.layer_count', 1);

        $this->postJson('/api/fish/calculate-layers', [
            'pond_depth_ft' => 5,
            'pond_area_sqm' => 400,
        ])->assertOk()->assertJsonPath('data.layer_count', 2);

        $this->postJson('/api/fish/calculate-layers', [
            'pond_depth_ft' => 7,
            'pond_area_sqm' => 400,
        ])->assertOk()->assertJsonPath('data.layer_count', 3);
    }

    public function test_guest_can_save_and_load_fish_plans_without_login(): void
    {
        Storage::fake('local');

        $key = 'guest_testkey_abc12';
        $save = $this->postJson('/api/fish/client-plans', [
            'client_key' => $key,
            'active_plan_id' => 'fish_1',
            'plans' => [
                ['id' => 'fish_1', 'name' => 'পুকুর ১', 'depth' => 6],
            ],
        ]);
        $save->assertOk()->assertJsonPath('success', true)->assertJsonPath('data.count', 1);

        $load = $this->getJson('/api/fish/client-plans?client_key=' . $key);
        $load->assertOk()->assertJsonPath('data.plans.0.name', 'পুকুর ১');
    }

    public function test_guest_can_save_fish_reminders_without_login(): void
    {
        Storage::fake('local');
        $key = 'guest_testkey_rmd99';

        $this->postJson('/api/fish/client-reminders', [
            'client_key' => $key,
            'reminders' => [
                [
                    'id' => 'rm_1',
                    'task' => 'lime',
                    'date' => '2026-09-01',
                    'plan_id' => 'fish_1',
                    'domain' => 'fish',
                ],
            ],
        ])->assertOk()->assertJsonPath('data.count', 1);

        $this->getJson('/api/fish/client-reminders?client_key=' . $key)
            ->assertOk()
            ->assertJsonPath('data.reminders.0.task', 'lime');
    }
}
