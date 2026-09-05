<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List all users with pagination and role filter
     */
    public function index(Request $request): JsonResponse
    {
        $role = $request->input('role');
        $search = $request->input('search');

        $query = User::with(['division', 'district', 'upazila'])->latest('id');

        if ($role) {
            $query->where('role', $role);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('mobile', 'LIKE', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($query->paginate(20)),
        ]);
    }

    /**
     * Toggle active/blocked status of a user
     */
    public function toggleStatus(int $id, Request $request): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $request->user()->id,
            'action' => 'toggle_user_status',
            'target_type' => 'user',
            'target_id' => $user->id,
            'details_json' => ['new_status' => $user->is_active],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully.',
            'is_active' => (bool)$user->is_active,
        ]);
    }

    /**
     * Update user role
     */
    public function updateRole(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'role' => 'required|in:farmer,dealer,extension_officer,ngo_worker',
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $request->input('role')]);

        return response()->json([
            'success' => true,
            'message' => 'User role updated.',
            'data' => new UserResource($user),
        ]);
    }
}
