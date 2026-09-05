<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error_code' => 'unauthenticated',
                'message' => 'Authentication required.',
            ], 401);
        }

        if (!in_array($user->role, $roles, true)) {
            return response()->json([
                'success' => false,
                'error_code' => 'forbidden_role',
                'message' => 'Your user role (' . $user->role . ') does not have permission to perform this action.',
            ], 403);
        }

        return $next($request);
    }
}
