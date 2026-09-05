<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Models\OtpLog;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OtpController extends Controller
{
    protected SmsService $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    /**
     * Send 6-digit OTP to mobile number
     */
    public function send(SendOtpRequest $request): JsonResponse
    {
        $mobile = $request->validated('mobile');
        $purpose = $request->validated('purpose', 'login');

        // Check if currently locked due to too many failed attempts
        $recentFailures = OtpLog::where('mobile', $mobile)
            ->where('created_at', '>=', now()->subMinutes(30))
            ->where('attempts', '>=', 5)
            ->exists();

        if ($recentFailures) {
            return response()->json([
                'success' => false,
                'error_code' => 'otp_locked',
                'message' => 'This mobile number is temporarily locked for 30 minutes due to repeated incorrect attempts.',
            ], 429);
        }

        // Generate 6-digit OTP
        $otp = (string)random_int(100000, 999999);
        // For testing/mock demo mobile: keep predictable OTP '123456' in local environment
        if (app()->environment('local', 'testing') && in_array($mobile, ['01711111111', '01822222222', '01933333333'])) {
            $otp = '123456';
        }

        OtpLog::create([
            'mobile' => $mobile,
            'otp_hash' => Hash::make($otp),
            'purpose' => $purpose,
            'attempts' => 0,
            'max_attempts' => 5,
            'expires_at' => now()->addMinutes(5),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        // Send OTP via SMS service (dispatches to gateway / mock)
        $this->smsService->sendOtp($mobile, $otp);

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully to your mobile number.',
            'expires_in_seconds' => 300,
            'debug_otp' => app()->environment('local', 'testing') ? $otp : null,
        ]);
    }

    /**
     * Verify 6-digit OTP and issue Sanctum personal access token
     */
    public function verify(VerifyOtpRequest $request): JsonResponse
    {
        $mobile = $request->validated('mobile');
        $otp = $request->validated('otp');

        $otpLog = OtpLog::where('mobile', $mobile)
            ->whereNull('used_at')
            ->where('expires_at', '>=', now())
            ->latest('id')
            ->first();

        if (!$otpLog) {
            return response()->json([
                'success' => false,
                'error_code' => 'otp_expired',
                'message' => 'OTP has expired or does not exist. Please request a new OTP.',
            ], 400);
        }

        if ($otpLog->attempts >= $otpLog->max_attempts) {
            return response()->json([
                'success' => false,
                'error_code' => 'otp_max_attempts_exceeded',
                'message' => 'Maximum verification attempts exceeded. Please wait and request a new OTP.',
            ], 429);
        }

        // Verify hash
        if (!Hash::check($otp, $otpLog->otp_hash)) {
            $otpLog->increment('attempts');
            $remaining = $otpLog->max_attempts - $otpLog->attempts;

            return response()->json([
                'success' => false,
                'error_code' => 'otp_invalid',
                'message' => "Invalid OTP entered. {$remaining} attempt(s) remaining.",
                'remaining_attempts' => max(0, $remaining),
            ], 422);
        }

        // Mark OTP as used
        $otpLog->update(['used_at' => now()]);

        // Find or create user
        $user = User::where('mobile', $mobile)->first();
        $isNewUser = false;

        if (!$user) {
            $isNewUser = true;
            $user = User::create([
                'mobile' => $mobile,
                'name' => 'নতুন কৃষক',
                'role' => 'farmer',
                'language' => 'bn',
                'is_active' => true,
                'is_verified' => true,
            ]);
        } else {
            $user->update(['is_verified' => true]);
        }

        // Generate long-lived Sanctum Personal Access Token
        $token = $user->createToken('folika-mobile-app', ['*'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully.',
            'token' => $token,
            'is_new_user' => $isNewUser,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'mobile' => $user->mobile,
                'role' => $user->role,
                'farm_type' => $user->farm_type,
                'division_id' => $user->division_id,
                'district_id' => $user->district_id,
                'upazila_id' => $user->upazila_id,
                'aez_code' => $user->aez_code,
                'language' => $user->language,
            ],
        ]);
    }
}
