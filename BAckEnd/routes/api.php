<?php

use App\Http\Controllers\CommandeController;
use App\Http\Controllers\FormateurController;
use App\Http\Controllers\materielController;
use App\Http\Controllers\SalleController;
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

Route::middleware(['auth:sanctum', 'verified'])->get('/user', function (Request $request) {
    return $request->user();
});

// User Management Routes
// Role-Based Routes
Route::middleware(['auth:sanctum', 'user-role:SuperAdmin', 'verified'])->group(function () {
    // Routes accessible only to authenticated users with the 'SuperAdmin' role
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/user-id/{id}', [UserController::class, 'getUserById']);
    Route::put('/update-user/{id}', [UserController::class, 'update']);
    Route::post('/add-user', [UserController::class, 'store']);
    Route::delete('/delete-user/{id}', [UserController::class, 'destroy']);
    Route::post('/change-is-active/{id}', [UserController::class, 'updateIsActive']);

    //Email route 
    Route::post('/send-email-add-user', [EmailController::class, 'sendEmailAddUser']);
    Route::put('/send-email-edit-user/{id}', [EmailController::class, 'sendEmailEditUser']);
    Route::delete('/send-email-delete-user/{id}', [EmailController::class, 'sendEmailDeteteUser']);
    Route::patch('/send-email-assign-role/{email}', [EmailController::class, 'sendEmailAssignRole']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [UserController::class, 'show']);
    Route::put('/edit-profile/{id}', [UserController::class, 'updateProfile'])->middleware(['verified']);
    Route::post('/google-logout', [UserController::class, 'logoutFromGoogle'])->middleware(['verified']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/salles', [SalleController::class, 'index']);
    Route::get('/salle-id/{id}', [salleController::class, 'show']);
    Route::put('/update-salle/{id}', [salleController::class, 'update']);
    Route::post('/add-salle', [salleController::class, 'store']);
    Route::delete('/delete-salle/{id}', [salleController::class, 'destroy']);
});

Route::get('/user-email/{email}', [UserController::class, 'getUserByEmail']);

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/materiaux', [MaterielController::class, 'index']);
    Route::get('/materiel-id/{id}', [MaterielController::class, 'show']);
    Route::put('/update-materiel/{id}', [MaterielController::class, 'update']);
    Route::post('/add-materiel', [MaterielController::class, 'store']);
    Route::delete('/delete-materiel/{id}', [MaterielController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/formateurs', [FormateurController::class, 'index']);
    Route::get('/formateur-id/{id}', [FormateurController::class, 'show']);
    Route::put('/update-formateur/{id}', [FormateurController::class, 'update']);
    Route::post('/add-formateur', [FormateurController::class, 'store']);
    Route::delete('/delete-formateur/{id}', [FormateurController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::get('/commande-id/{id}', [CommandeController::class, 'show']);
    Route::put('/update-commande/{id}', [CommandeController::class, 'update']);
    Route::post('/add-commande', [CommandeController::class, 'store']);
    // Route::delete('/delete-commande/{id}', [CommandeController::class, 'destroy']);
    Route::post('/update-commande-status/{id}', [CommandeController::class, 'updateStatus']);
    Route::get('/products', [CommandeController::class, 'getProducts']);
    Route::get('/suppliers', [CommandeController::class, 'getSuppliers']);
});