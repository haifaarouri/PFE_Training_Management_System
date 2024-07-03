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
    public function redirectToLinkedIn(Request $request)
    {
        $imageId = $request->imageId;
        $message = $request->message;

        // Store these in the session or pass them to the callback handler
        session(['image_id_to_share' => $imageId, 'message_to_share' => $message]);

        $clientId = '78qcie9wzyy5ml';
        $redirectUri = 'http://localhost:3000/auth/linkedin/callback';
        $scopes = 'openid profile email w_member_social';
        $state = bin2hex(random_bytes(16));  // Generate a random state for security

        session(['linkedin_oauth_state' => $state]);  // Store state in session for later validation

        $url = "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={$clientId}&redirect_uri={$redirectUri}&scope={$scopes}&state={$state}";
        \Log::info('url redirect to linkedin provider controller ' . $url);
        return redirect()->to($url);
    }

    public function handleLinkedInCallback(Request $request)
    {
        \Log::info('request all provider controller ' . $request->all());
        $state = $request->state;
        $storedState = session('linkedin_oauth_state');

        // Validate the state to prevent CSRF attacks
        if ($state !== $storedState) {
            return redirect()->to('/login')->withErrors('Invalid state parameter');
        }

        try {
            $client = new \GuzzleHttp\Client();
            $redirectUri = 'http://localhost:3000/auth/linkedin/callback';
            $response = $client->post('https://www.linkedin.com/oauth/v2/accessToken', [
                'headers' => [
                    'Content-Type' => 'application/x-www-form-urlencoded'  // Ensure correct Content-Type
                ],
                'form_params' => [
                    'grant_type' => 'authorization_code',
                    'code' => $request->code,
                    'redirect_uri' => $redirectUri,
                    'client_id' => env('LINKEDIN_CLIENT_ID'),
                    'client_secret' => env('LINKEDIN_CLIENT_SECRET')
                ],
            ]);

            $accessToken = json_decode($response->getBody()->getContents(), true)['access_token'];
            session(['linkedin_access_token' => $accessToken]);

            // Fetch user's LinkedIn profile to get personURN
            $profileResponse = $client->request('GET', 'https://api.linkedin.com/v2/userinfo', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken
                ]
            ]);

            $profileData = json_decode($profileResponse->getBody()->getContents(), true);
            $personURN = $profileData['sub'];  // Assuming 'id' holds the personURN

            // Redirect to your internal route that handles the share
            return redirect()->route('linkedin.share', [
                'image_id' => $request->session()->get('image_id_to_share'),
                'message' => $request->session()->get('message_to_share'),
                'personURN' => $personURN,
                'accessToken' => $accessToken
            ]);

        } catch (\Exception $e) {
            \Log::error("Error during LinkedIn authentication: " . $e->getMessage());
            return redirect()->to('/login')->withErrors('Failed to login with LinkedIn.');
        }
    }

}
