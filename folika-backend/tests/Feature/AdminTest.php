<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Admin::updateOrCreate(
            ['email' => 'admin@folika.gov.bd'],
            [
                'name' => 'Super Admin',
                'password_hash' => Hash::make('Admin@Folika2026'),
                'admin_level' => 'super_admin',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['mobile' => '01711111111'],
            [
                'name' => 'মোঃ মনিরুজ্জামান',
                'role' => 'farmer',
                'language' => 'bn',
                'is_active' => true,
            ]
        );
    }

    public function test_admin_can_login_and_access_admin_dashboard(): void
    {
        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@folika.gov.bd',
            'password' => 'Admin@Folika2026',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'admin' => [
                    'email' => 'admin@folika.gov.bd',
                    'admin_level' => 'super_admin',
                ],
            ]);

        $admin = Admin::where('email', 'admin@folika.gov.bd')->first();

        // Access dashboard
        $dash = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard');
        $dash->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_regular_farmer_cannot_access_admin_routes(): void
    {
        $farmer = User::where('mobile', '01711111111')->first();

        $response = $this->actingAs($farmer, 'sanctum')->getJson('/api/admin/dashboard');

        // Role/guard check prevents regular farmer from accessing admin endpoints
        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error_code' => 'admin_unauthorized',
            ]);
    }
}
