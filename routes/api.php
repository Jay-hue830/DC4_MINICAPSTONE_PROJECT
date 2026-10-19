<?php

use App\Http\Controllers\Api\AssistanceRequestController;
use App\Http\Controllers\Api\AssistanceTypeController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SeniorCitizenController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {

    // Admin and senior (controller scopes seniors to their own data)
    Route::get('assistance-types', AssistanceTypeController::class);
    Route::apiResource('assistance-requests', AssistanceRequestController::class);

    // Admin only
    Route::middleware('admin')->group(function () {
        Route::patch('assistance-requests/{assistance_request}/status',
            [AssistanceRequestController::class, 'updateStatus']);
        Route::apiResource('senior-citizens', SeniorCitizenController::class);
        Route::get('dashboard', DashboardController::class);
    });
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'time' => now()->toIso8601String(),
    ]);
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// Private routes (Authorization: Bearer TOKEN)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Temporary route to test role middleware; remove on Day 6
    Route::get('/admin/ping', fn (Request $request) => response()->json([
        'message' => 'Welcome, admin '.$request->user()->name.'.',
    ]))->middleware('role:admin');
});
