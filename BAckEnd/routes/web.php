<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';

//Pilote du processus Routes
// Route::middleware(['auth', 'user-role:PiloteDuProcessus'])->group(function() {
//     Route::get("/pilote/home", [PiloteHomeController::class, 'piloteHome'])->name('pilote.home');
// });

// //Sales Routes
// Route::middleware(['auth', 'user-role:Sales'])->group(function() {
//     Route::get("/sales/home", [SalesHomeController::class, 'salesHome'])->name('sales.home');
// });

//Pilote du processus Routes
// Route::middleware(['auth', 'user-role:PiloteDuProcessus'])->group(function() {
//     Route::get("/pilote-home", [PiloteHomeController::class, 'piloteHome'])->name('piloteHome');
// });