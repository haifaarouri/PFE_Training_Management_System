<?php

use App\Http\Controllers\MaterielController;
use App\Http\Controllers\SessionImageController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ProviderController;

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

require __DIR__ . '/auth.php';

Route::get('/auth/google/redirect', [ProviderController::class, 'redirect']);
Route::get('/auth/google/callback', [ProviderController::class, 'callback']);

Route::post('/upload-chunk', [MaterielController::class, 'uploadChunk']);
Route::get('/test', function () {
    dd(phpinfo());
});

Route::get('auth/linkedin', [ProviderController::class, 'redirectToLinkedIn']);
Route::post('auth/linkedin/callback', [ProviderController::class, 'handleLinkedInCallback']);
// Route::get('/linkedin/share/{image_id}', [SessionImageController::class, 'shareOnLinkedIn'])->name('linkedin.share');

Route::get('/auth/facebook', 'FacebookController@redirectToFacebook');
Route::get('/facebook/callback', 'FacebookController@handleFacebookCallback');
Route::post('/share/facebook', 'FacebookController@shareOnFacebook');