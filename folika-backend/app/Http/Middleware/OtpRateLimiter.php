<?php

namespace App\Http\Middleware;

use App\Models\OtpLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OtpRateLimiter
{
    /**
     * Rate limit OTP requests against otp_logs table
     */
    public function handle(Request $request, Closure $next): Response
    {
        $mobile = $request->input('mobile');
        $ip = $request->ip();

        if ($mobile) {
            // Check mobile attempt count in the last 1 hour
            $mobileCount = OtpLog::where('mobile', $mobile)
                ->where('created_at', '>=', now()->subHour())
                ->count();

            if ($mobileCount >= 5) {
                return response()->json([
                    'success' => false,
                    'error_code' => 'otp_rate_limit_mobile',
                    'message' => 'Too many OTP requests for this mobile number. Please try again after 1 hour.',
                ], 429);
            }
        }

        // Check IP count in the last 1 hour
        $ipCount = OtpLog::where('ip_address', $ip)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($ipCount >= 10) {
            return response()->json([
                'success' => false,
                'error_code' => 'otp_rate_limit_ip',
                'message' => 'Too many OTP requests from your IP address. Please try again later.',
            ], 429);
        }

        return $next($request);
    }
}
