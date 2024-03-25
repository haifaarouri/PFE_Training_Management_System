<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use GuzzleHttp\Exception\ClientException;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;

class ProviderController extends Controller
{
    public function redirect()
    {
        return response()->json([
            'url' => Socialite::driver('google')
                ->stateless()
                ->redirect()
                ->getTargetUrl(),
        ]);
    }

    public function callback()
    {
        try {
            $socialiteUser = Socialite::driver('google')->stateless()->user();
            $existingUser = User::where('email', $socialiteUser->getEmail())->first();

            if ($existingUser && $existingUser->provider == null) {
                return response()->json(['error' => 'Cet e-mail utilise une autre méthode d\'authentification'], 401);
            }

            // Check if the user already exists
            if ($existingUser) {
                // Update the existing user's email_verified_at if it's null
                if (is_null($existingUser->email_verified_at)) {
                    $existingUser->email_verified_at = Carbon::now();
                    $existingUser->save();
                }
                $user = $existingUser;
            } else {
                // Create a new user and set email_verified_at to now
                $user = User::create([
                    'firstName' => $socialiteUser->user['given_name'],
                    'lastName' => $socialiteUser->user['family_name'],
                    'email' => $socialiteUser->email,
                    'profileImage' => $socialiteUser->avatar,
                    'email_verified_at' => Carbon::now(),
                    'provider_token' => $socialiteUser->token,
                    'provider_id' => $socialiteUser->id,
                    'provider' => 'google',
                ]);
            }

        } catch (ClientException $e) {
            return response()->json(['error' => 'Informations d\'identification fournies sont non valides !'], 422);
        }

        return response()->json([
            'user' => $user,
            'access_token' => $user->createToken('google-token')->plainTextToken,
            'token_type' => 'Bearer',
        ]);
    }
}
