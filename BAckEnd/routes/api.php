<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Route::middleware('auth:sanctum')->get('/user', [UserController::class, 'show']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/user', [UserController::class, 'show']);
    Route::get('/user-id/{id}', [UserController::class, 'getUserById']);
    Route::put('/update-user/{id}', [UserController::class, 'update']);
    Route::post('/add-user', [UserController::class, 'store']);
    Route::delete('/delete-user/{id}', [UserController::class, 'destroy']);
    Route::put('/edit-profile/{id}', [UserController::class, 'updateProfile']);
});
