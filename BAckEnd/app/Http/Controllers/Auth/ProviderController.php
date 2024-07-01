<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Http\Request;
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
                $user = $existingUser->load('notifications');
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

    // Redirect to LinkedIn for authentication
    public function redirectToLinkedIn()
    {
        $clientId = '78qcie9wzyy5ml';
        $redirectUri = urlencode('http://localhost:3000/auth/linkedin/callback');
        $scopes = 'openid profile email w_member_social';  // Include other scopes as needed
        $state = bin2hex(random_bytes(16));  // Generate a random state for security

        session(['linkedin_oauth_state' => $state]);  // Store state in session for later validation

        $url = "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={$clientId}&redirect_uri={$redirectUri}&scope={$scopes}&state={$state}";

        return redirect()->to($url);
        // return response()->json([
        //     'url' => Socialite::driver('linkedin')
        //         ->stateless()
        //         ->scopes(['openid', 'profile', 'email', 'w_member_social'])
        //         ->redirect()
        //         ->getTargetUrl(),
        // ]);
        // return Socialite::driver('linkedin')->scopes(['profile', 'email', 'w_member_social'])->redirect();
    }

    // Handle the callback from LinkedIn
    // public function handleLinkedInCallback()
    // {
    //     try {
    //         $socialiteUser = Socialite::driver('linkedin')->stateless()->user();
    //         \Log::info(json_encode($socialiteUser));
    //         // $existingUser = User::where('email', $socialiteUser->getEmail())->first();

    //         // if ($existingUser && $existingUser->provider == null) {
    //         //     return response()->json(['error' => 'Cet e-mail utilise une autre méthode d\'authentification'], 401);
    //         // }

    //         // // Check if the user already exists
    //         // if ($existingUser) {
    //         //     // Update the existing user's email_verified_at if it's null
    //         //     if (is_null($existingUser->email_verified_at)) {
    //         //         $existingUser->email_verified_at = Carbon::now();
    //         //         $existingUser->save();
    //         //     }
    //         //     $user = $existingUser->load('notifications');
    //         // } else {
    //         //     // Create a new user and set email_verified_at to now
    //         //     $user = User::create([
    //         //         'firstName' => $socialiteUser->user['given_name'],
    //         //         'lastName' => $socialiteUser->user['family_name'],
    //         //         'email' => $socialiteUser->email,
    //         //         'profileImage' => $socialiteUser->avatar,
    //         //         'email_verified_at' => Carbon::now(),
    //         //         'provider_token' => $socialiteUser->token,
    //         //         'provider_id' => $socialiteUser->id,
    //         //         'provider' => 'linkedIn',
    //         //     ]);
    //         // }

    //         // return response()->json([
    //         //     'user' => $user,
    //         //     'access_token' => $user->createToken('linkedIn-token')->plainTextToken,
    //         //     'token_type' => 'Bearer',
    //         // ]);

    //         $user = auth()->user(); // Get the currently authenticated user

    //         // Update the user with LinkedIn data
    //         $user->update([
    //             'linkedin_id' => $socialiteUser->id,
    //             'linkedin_email' => $socialiteUser->email,
    //             'linkedin_token' => $socialiteUser->token,
    //             'linkedin_refresh_token' => $socialiteUser->refreshToken, // Store refresh token if available
    //             'linkedin_expires_in' => $socialiteUser->expiresIn, // Token expiry
    //         ]);

    //         return response()->json([
    //             'user' => $user,
    //             'access_token' => $user->createToken('linkedIn-token')->plainTextToken,
    //             'token_type' => 'Bearer',
    //         ]);
    //     } catch (\Exception $e) {
    //         \Log::error("Error during LinkedIn authentication: " . $e->getMessage());

    //         return response()->json(['error' => 'Unable to login using LinkedIn.'], 500);
    //     }
    // }

    public function getUserInfo(Request $request)
    {
        $accessToken = $request->access_token;

        $client = new \GuzzleHttp\Client();
        $response = $client->request('GET', 'https://api.linkedin.com/v2/me', [
            'headers' => [
                'Authorization' => 'Bearer ' . $accessToken,
            ],
        ]);

        $userData = json_decode($response->getBody()->getContents(), true);

        return view('userinfo', ['user' => $userData]);
    }

    public function handleLinkedInCallback(Request $request)
    {
        \Log::info($request->all());
        $state = $request->state;
        $storedState = session('linkedin_oauth_state');

        // Validate the state to prevent CSRF attacks
        if ($state !== $storedState) {
            return redirect()->to('/login')->withErrors('Invalid state parameter');
        }

        try {
            $client = new \GuzzleHttp\Client();

            $response = $client->post('https://www.linkedin.com/oauth/v2/accessToken', [
                'form_params' => [
                    'grant_type' => 'authorization_code',
                    'code' => $request->code,
                    'redirect_uri' => 'http://localhost:3000/auth/linkedin/callback',
                    'client_id' => 'your-client-id',
                    'client_secret' => 'your-client-secret',
                ],
            ]);

            $accessToken = json_decode($response->getBody()->getContents(), true)['access_token'];

            // Redirect to /userinfo with the access token
            return redirect()->to('/userinfo?access_token=' . $accessToken);
        } catch (\Exception $e) {
            \Log::error("Error during LinkedIn authentication: " . $e->getMessage());
            return redirect()->to('/login')->withErrors('Failed to login with LinkedIn.');
        }
    }

    public function redirectToLinkedInShare()
    {
        $user = Socialite::driver('linkedin')->user();
        $shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' . urlencode('http://localhost:3000/auth/linkedin/callback');

        // Redirect to LinkedIn share modal
        return redirect()->away($shareUrl);
    }
}
