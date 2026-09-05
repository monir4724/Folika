<?php

namespace Tests\Feature;

use App\Models\OtpLog;
use App\Models\User;
use Tests\TestCase;

class AuthTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        OtpLog::where('mobile', '01711111111')->delete();
    }

    public function test_can_send_otp_to_mobile(): void
    {
        $response = $this->postJson('/api/auth/otp/send', [
            'mobile' => '01711111111',
            'purpose' => 'login',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'expires_in_seconds' => 300,
            ]);
    }

    public function test_can_verify_otp_and_receive_sanctum_token(): void
    {
        // First send OTP
        $this->postJson('/api/auth/otp/send', [
            'mobile' => '01711111111',
            'purpose' => 'login',
        ]);

        // Verify with demo OTP 123456
        $response = $this->postJson('/api/auth/otp/verify', [
            'mobile' => '01711111111',
            'otp' => '123456',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'token',
                'is_new_user',
                'user' => ['id', 'name', 'mobile'],
            ]);
    }

    public function test_authenticated_user_can_access_profile_and_summary(): void
    {
        $user = User::where('mobile', '01711111111')->first();
        if (!$user) {
            $user = User::create([
                'name' => 'মোঃ মনিরুজ্জামান',
                'mobile' => '01711111111',
                'role' => 'farmer',
                'language' => 'bn',
                'is_active' => true,
            ]);
        }

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/user/profile');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'mobile' => '01711111111',
                ],
            ]);
    }
}
