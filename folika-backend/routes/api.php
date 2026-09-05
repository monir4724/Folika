<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\OtpController;
use App\Http\Controllers\Api\Community\ForumPostController;
use App\Http\Controllers\Api\Community\ForumReplyController;
use App\Http\Controllers\Api\Community\ReportController;
use App\Http\Controllers\Api\Community\VoteController;
use App\Http\Controllers\Api\Crop\CropCostController;
use App\Http\Controllers\Api\Crop\CropPlanController;
use App\Http\Controllers\Api\Crop\CropRevenueController;
use App\Http\Controllers\Api\DiseaseDetectionController;
use App\Http\Controllers\Api\Fish\FishClientStoreController;
use App\Http\Controllers\Api\Fish\FishPlanController;
use App\Http\Controllers\Api\Fish\FishSpeciesController;
use App\Http\Controllers\Api\Livestock\LivestockPlanController;
use App\Http\Controllers\Api\Livestock\VaccineScheduleController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\Market\DealerController;
use App\Http\Controllers\Api\Market\DealerReviewController;
use App\Http\Controllers\Api\Market\MarketPriceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\SystemController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WeatherController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FOLIKA API Routes
|--------------------------------------------------------------------------
*/

// Public system routes (frontend bootstrap + connectivity check)
Route::get('/config', [SystemController::class, 'config']);
Route::get('/health', [SystemController::class, 'health']);
Route::post('/fish/calculate-layers', [FishPlanController::class, 'calculateLayers']);
Route::post('/fish/client-plans', [FishClientStoreController::class, 'savePlans']);
Route::get('/fish/client-plans', [FishClientStoreController::class, 'loadPlans']);
Route::post('/fish/client-reminders', [FishClientStoreController::class, 'saveReminders']);
Route::get('/fish/client-reminders', [FishClientStoreController::class, 'loadReminders']);

// Public Location routes
Route::prefix('location')->group(function () {
    Route::get('/divisions', [LocationController::class, 'divisions']);
    Route::get('/districts/{id}', [LocationController::class, 'districts']);
    Route::get('/upazilas/{id}', [LocationController::class, 'upazilas']);
    Route::get('/aez/{upazilaId}', [LocationController::class, 'aez']);
    Route::get('/reverse', [LocationController::class, 'reverse']);
    Route::get('/resolve', [LocationController::class, 'resolve']);
});

Route::prefix('weather')->group(function () {
    Route::get('/current', [WeatherController::class, 'current']);
    Route::get('/forecast', [WeatherController::class, 'forecast']);
    Route::get('/alerts', [WeatherController::class, 'alerts']);
});

Route::get('/market/dealers', [DealerController::class, 'index']);
Route::get('/community/posts', [ForumPostController::class, 'index']);
Route::get('/disease/nearby-centers', [DiseaseDetectionController::class, 'nearbyCenters']);

// Authentication endpoints
Route::prefix('auth')->group(function () {
    Route::post('/otp/send', [OtpController::class, 'send'])->middleware('otp.limit');
    Route::post('/otp/verify', [OtpController::class, 'verify']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/onboarding', [AuthController::class, 'onboarding']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    });
});

// Authenticated Farmer/Dealer/Officer API Endpoints
Route::middleware('auth:sanctum')->group(function () {
    // User profile and farm summary
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'profile']);
        Route::patch('/profile', [UserController::class, 'updateProfile']);
        Route::patch('/preferences', [UserController::class, 'changePreferences']);
        Route::post('/fcm-token', [UserController::class, 'updateFcmToken']);
        Route::get('/summary', [UserController::class, 'summary']);
        Route::delete('/account', [UserController::class, 'deleteAccount']);
    });

    // Crop management
    Route::prefix('crops')->group(function () {
        Route::get('/master', [CropPlanController::class, 'master']);
        Route::get('/recommendations', [CropPlanController::class, 'recommendations']);
        Route::post('/rotation-advice', [CropPlanController::class, 'rotationAdvice']);
        Route::get('/weather-irrigation', [CropPlanController::class, 'weatherIrrigation']);
        Route::get('/plans', [CropPlanController::class, 'index']);
        Route::post('/plans', [CropPlanController::class, 'store']);
        Route::get('/plans/{id}', [CropPlanController::class, 'show']);
        Route::patch('/plans/{id}', [CropPlanController::class, 'update']);
        Route::delete('/plans/{id}', [CropPlanController::class, 'destroy']);
        Route::get('/plans/{id}/costs', [CropCostController::class, 'index']);
        Route::post('/plans/{id}/costs', [CropCostController::class, 'store']);
        Route::delete('/plans/{id}/costs/{costId}', [CropCostController::class, 'destroy']);
        Route::get('/plans/{id}/revenues', [CropRevenueController::class, 'index']);
        Route::post('/plans/{id}/revenues', [CropRevenueController::class, 'store']);
        Route::delete('/plans/{id}/revenues/{revenueId}', [CropRevenueController::class, 'destroy']);
    });

    // Fish management
    Route::prefix('fish')->group(function () {
        Route::get('/species', [FishSpeciesController::class, 'index']);
        Route::get('/species-recommend', [FishSpeciesController::class, 'recommend']);
        Route::get('/plans', [FishPlanController::class, 'index']);
        Route::post('/plans', [FishPlanController::class, 'store']);
        Route::get('/plans/{id}', [FishPlanController::class, 'show']);
        Route::patch('/plans/{id}', [FishPlanController::class, 'update']);
        Route::delete('/plans/{id}', [FishPlanController::class, 'destroy']);
        Route::post('/plans/{id}/species', [FishPlanController::class, 'addSpecies']);
    });

    // Livestock management
    Route::prefix('livestock')->group(function () {
        Route::get('/breeds', [LivestockPlanController::class, 'breeds']);
        Route::post('/capacity-check', [LivestockPlanController::class, 'capacityCheck']);
        Route::get('/plans', [LivestockPlanController::class, 'index']);
        Route::post('/plans', [LivestockPlanController::class, 'store']);
        Route::get('/plans/{id}', [LivestockPlanController::class, 'show']);
        Route::patch('/plans/{id}', [LivestockPlanController::class, 'update']);
        Route::delete('/plans/{id}', [LivestockPlanController::class, 'destroy']);
        Route::post('/plans/{id}/generate-vaccines', [LivestockPlanController::class, 'generateVaccines']);
        Route::get('/plans/{id}/vaccines', [VaccineScheduleController::class, 'index']);
        Route::post('/plans/{id}/vaccines', [VaccineScheduleController::class, 'store']);
        Route::patch('/plans/{id}/vaccines/{vaccineId}/complete', [VaccineScheduleController::class, 'markCompleted']);
    });

    // Disease diagnosis
    Route::prefix('disease')->group(function () {
        Route::post('/analyze', [DiseaseDetectionController::class, 'analyze']);
        Route::get('/history', [DiseaseDetectionController::class, 'history']);
        Route::get('/{id}', [DiseaseDetectionController::class, 'show']);
    });

    // Community forum & dealer reports
    Route::prefix('community')->group(function () {
        Route::post('/posts', [ForumPostController::class, 'store']);
        Route::get('/posts/{id}', [ForumPostController::class, 'show']);
        Route::delete('/posts/{id}', [ForumPostController::class, 'destroy']);
        Route::post('/posts/{id}/reply', [ForumReplyController::class, 'store']);
        Route::delete('/replies/{id}', [ForumReplyController::class, 'destroy']);
        Route::post('/posts/{id}/vote', [VoteController::class, 'vote']);
        Route::post('/report', [ReportController::class, 'store']);
    });

    // Market & Dealers
    Route::prefix('market')->group(function () {
        Route::get('/prices', [MarketPriceController::class, 'index']);
        Route::post('/prices', [MarketPriceController::class, 'store']);
        Route::get('/dealers/my-shop', [DealerController::class, 'myShop'])->middleware('role:dealer');
        Route::get('/dealers/{id}', [DealerController::class, 'show']);
        Route::post('/dealers/{id}/review', [DealerReviewController::class, 'store']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::patch('/{id}/read', [NotificationController::class, 'read']);
        Route::post('/read-all', [NotificationController::class, 'readAll']);
    });

    // Offline synchronization
    Route::prefix('sync')->group(function () {
        Route::post('/', [SyncController::class, 'sync']);
        Route::get('/status', [SyncController::class, 'status']);
    });
});
