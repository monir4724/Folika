<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use App\Models\Admin;
use App\Models\AuditLog;
use App\Models\CropPlan;
use App\Models\Dealer;
use App\Models\DiseaseDetection;
use App\Models\FishPlan;
use App\Models\ForumPost;
use App\Models\LivestockPlan;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminDashboardController extends Controller
{
    /**
     * Admin login with password and issue Sanctum admin token
     */
    public function login(AdminLoginRequest $request): JsonResponse
    {
        $admin = Admin::where('email', $request->validated('email'))->first();

        if (!$admin || !Hash::check($request->validated('password'), $admin->password_hash)) {
            return response()->json([
                'success' => false,
                'error_code' => 'admin_invalid_credentials',
                'message' => 'Invalid admin email or password.',
            ], 401);
        }

        if (!$admin->is_active) {
            return response()->json([
                'success' => false,
                'error_code' => 'admin_deactivated',
                'message' => 'Your admin account has been deactivated.',
            ], 403);
        }

        $admin->update(['last_login_at' => now()]);

        AuditLog::create([
            'actor_type' => 'admin',
            'actor_id' => $admin->id,
            'action' => 'admin_login',
            'ip_address' => $request->ip(),
        ]);

        $token = $admin->createToken('folika-admin-token', ['admin:' . $admin->admin_level])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Admin logged in successfully.',
            'token' => $token,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'admin_level' => $admin->admin_level,
            ],
        ]);
    }

    /**
     * Admin dashboard summary metrics
     */
    public function dashboard(Request $request): JsonResponse
    {
        $totalFarmers = User::where('role', 'farmer')->count();
        $totalDealers = Dealer::count();
        $totalCropPlans = CropPlan::count();
        $totalFishPlans = FishPlan::count();
        $totalLivestockPlans = LivestockPlan::count();
        $totalDiseasesDetected = DiseaseDetection::count();
        $pendingReports = Report::where('status', 'pending')->count();
        $activeForumPosts = ForumPost::where('status', 'active')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'counts' => [
                    'farmers' => $totalFarmers,
                    'dealers' => $totalDealers,
                    'crop_plans' => $totalCropPlans,
                    'fish_plans' => $totalFishPlans,
                    'livestock_plans' => $totalLivestockPlans,
                    'disease_scans' => $totalDiseasesDetected,
                    'pending_reports' => $pendingReports,
                    'forum_posts' => $activeForumPosts,
                ],
                'recent_scans' => DiseaseDetection::with('user:id,name,mobile')->latest('id')->limit(5)->get(),
                'recent_reports' => Report::with('reporter:id,name')->where('status', 'pending')->latest('id')->limit(5)->get(),
            ],
        ]);
    }
}
