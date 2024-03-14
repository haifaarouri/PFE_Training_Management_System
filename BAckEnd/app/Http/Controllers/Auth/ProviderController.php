<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ProviderController extends Controller
{
    public function redirect()
    {
        // return Socialite::driver('google')->redirect();
        return response()->json([
            'url' => Socialite::driver('google')
                ->stateless()
                ->redirect()
                ->getTargetUrl(),
        ]);
    }

    public function callback()
    {
        // $socialUser = Socialite::driver('google')->user();

        // $user = User::updateOrCreate([
        //     'provider_id' => $socialUser->id,
        //     'provider' => 'google'
        // ], [
        //     'firstName' => $socialUser->user['given_name'],
        //     'lastName' => $socialUser->user['family_name'],
        //     'email' => $socialUser->email,
        //     'profileImage' => $socialUser->avatar,
        //     'email_verified_at' => now(),
        //     'provider_token' => $socialUser->token,
        //     // 'provider_refresh_token' => $socialUser->refreshToken,
        // ]);

        // Auth::login($user);

        // return response()->noContent();

        try {
            $socialiteUser = Socialite::driver('google')->stateless()->user();
        } catch (ClientException $e) {
            return response()->json(['error' => 'Invalid credentials provided.'], 422);
        }

        $user = User::query()
            ->firstOrCreate(
                [
                    'email' => $socialiteUser->getEmail(),
                ],
                [
                    'firstName' => $socialiteUser->user['given_name'],
                    'lastName' => $socialiteUser->user['family_name'],
                    'email' => $socialiteUser->email,
                    'profileImage' => $socialiteUser->avatar,
                    'email_verified_at' => now(),
                    'provider_token' => $socialiteUser->token,
                    'provider_id' => $socialiteUser->id,
                    'provider' => 'google'
                ]
            );

        // Auth::login($user);

        return response()->json([
            'user' => $user,
            'access_token' => $user->createToken('google-token')->plainTextToken,
            'token_type' => 'Bearer',
        ]);
    }
}
