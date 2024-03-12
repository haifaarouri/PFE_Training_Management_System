<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmailController;

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

// User Management Routes
// Role-Based Routes
Route::middleware(['auth:sanctum', 'user-role:SuperAdmin'])->group(function () {
    // Routes accessible only to authenticated users with the 'SuperAdmin' role
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/user-id/{id}', [UserController::class, 'getUserById']);
    Route::put('/update-user/{id}', [UserController::class, 'update']);
    Route::post('/add-user', [UserController::class, 'store']);
    Route::delete('/delete-user/{id}', [UserController::class, 'destroy']);

    //Email route 
    Route::post('/send-email-add-user', [EmailController::class, 'sendEmailAddUser']);
    Route::put('/send-email-edit-user/{id}', [EmailController::class, 'sendEmailEditUser']);
    Route::delete('/send-email-delete-user/{id}', [EmailController::class, 'sendEmailDeteteUser']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [UserController::class, 'show']);
    Route::put('/edit-profile/{id}', [UserController::class, 'updateProfile']);
});