<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use GuzzleHttp\Client;
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
            $client = new Client();
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

    public function redirectToFacebook()
    {
        $clientId = env('FACEBOOK_CLIENT_ID');
        $redirectUri = env('FACEBOOK_REDIRECT_URI');
        $url = "https://www.facebook.com/v12.0/dialog/oauth?client_id={$clientId}&redirect_uri={$redirectUri}&scope=email,public_profile,publish_actions";
        return redirect()->to($url);
    }

    public function handleFacebookCallback(Request $request)
    {
        $code = $request->code;
        if (!$code) {
            return redirect('/')->with('error', 'Unauthorized access to Facebook');
        }

        $token = $this->getFacebookAccessToken($code);
        $user = $this->getFacebookUser($token);

        // Logic to handle user data

        return redirect('/home')->with('success', 'Successfully logged in with Facebook.');
    }

    protected function getFacebookAccessToken($code)
    {
        $clientId = env('FACEBOOK_CLIENT_ID');
        $clientSecret = env('FACEBOOK_CLIENT_SECRET');
        $redirectUri = env('FACEBOOK_REDIRECT_URI');
        $client = new Client();
        $response = $client->post('https://graph.facebook.com/v12.0/oauth/access_token', [
            'form_params' => [
                'client_id' => $clientId,
                'redirect_uri' => $redirectUri,
                'client_secret' => $clientSecret,
                'code' => $code,
            ],
        ]);

        $data = json_decode($response->getBody(), true);
        return $data['access_token'];
    }

    protected function getFacebookUser($accessToken)
    {
        $client = new Client();
        $response = $client->get('https://graph.facebook.com/v12.0/me', [
            'query' => [
                'access_token' => $accessToken,
                'fields' => 'id,name,email',
            ],
        ]);

        return json_decode($response->getBody(), true);
    }

    public function shareOnFacebook(Request $request)
    {
        $accessToken = $request->accessToken;
        $imagePath = public_path('path_to_your_image.jpg');
        $client = new Client();
        $response = $client->post('https://graph.facebook.com/v12.0/me/photos', [
            'multipart' => [
                [
                    'name' => 'source',
                    'contents' => fopen($imagePath, 'r')
                ],
                [
                    'name' => 'message',
                    'contents' => $request->message
                ]
            ],
            'headers' => [
                'Authorization' => 'Bearer ' . $accessToken
            ]
        ]);

        return response()->json(json_decode($response->getBody(), true));
    }

}
