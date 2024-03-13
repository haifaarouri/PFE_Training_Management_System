<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ProviderController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $socialUser = Socialite::driver('google')->user();

        $user = User::updateOrCreate([
            'provider_id' => $socialUser->id,
            'provider' => 'google'
        ], [
            'firstName' => $socialUser->user['given_name'],
            'lastName' => $socialUser->user['family_name'],
            'email' => $socialUser->email,
            'profileImage' => $socialUser->avatar,
            'email_verified_at' => now(),
            'provider_token' => $socialUser->token,
            // 'provider_refresh_token' => $socialUser->refreshToken,
        ]);

        Auth::login($user);

        return response()->noContent();
    }
}
