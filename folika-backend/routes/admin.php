<?php

use App\Http\Controllers\Api\Admin\AdminAuditController;
use App\Http\Controllers\Api\Admin\AdminBroadcastController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminMarketController;
use App\Http\Controllers\Api\Admin\AdminModerationController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FOLIKA Admin Routes
| Prefix: /api/admin
|--------------------------------------------------------------------------
*/

// Admin login
Route::post('/login', [AdminDashboardController::class, 'login']);

// Protected Admin routes (Requires Sanctum token belonging to Admin model + AdminAuthMiddleware)
Route::middleware(['auth:sanctum', 'admin.auth'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'dashboard']);

    // User management
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::patch('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
    Route::patch('/users/{id}/role', [AdminUserController::class, 'updateRole']);

    // Community moderation & official notices
    Route::get('/reports', [AdminModerationController::class, 'reports']);
    Route::patch('/reports/{id}/resolve', [AdminModerationController::class, 'resolveReport']);
    Route::post('/notices', [AdminModerationController::class, 'storeNotice']);

    // Market prices & Dealer verification
    Route::patch('/market/{id}/verify', [AdminMarketController::class, 'verifyPrice']);
    Route::patch('/dealers/{id}/verify', [AdminMarketController::class, 'verifyDealer']);

    // Push/SMS broadcast to target roles & districts
    Route::post('/broadcast', [AdminBroadcastController::class, 'broadcast']);

    // System audit logs
    Route::get('/audit-logs', [AdminAuditController::class, 'index']);
});
