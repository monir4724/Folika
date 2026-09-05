<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAuthMiddleware
{
    /**
     * Handle an incoming admin request.
     */
    public function handle(Request $request, Closure $next, ?string $requiredLevel = null): Response
    {
        $user = $request->user();

        // Check if token belongs to an Admin model
        if (!$user || !($user instanceof Admin)) {
            return response()->json([
                'success' => false,
                'error_code' => 'admin_unauthorized',
                'message' => 'Admin credentials required to access this endpoint.',
            ], 403);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'error_code' => 'admin_inactive',
                'message' => 'Admin account is currently deactivated.',
            ], 403);
        }

        if ($requiredLevel && $requiredLevel === 'super_admin' && $user->admin_level !== 'super_admin') {
            return response()->json([
                'success' => false,
                'error_code' => 'super_admin_required',
                'message' => 'This action requires Super Admin privileges.',
            ], 403);
        }

        return $next($request);
    }
}
