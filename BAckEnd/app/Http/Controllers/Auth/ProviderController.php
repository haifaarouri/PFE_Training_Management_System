<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;

class ProviderController extends Controller
{
    public function redirect (){
        return Socialite::driver('google')->redirect();
    }

    public function callback (){
       $googleUser = Socialite::driver('google')->user();
       dd($googleUser);
       // Find the user in your database or create a new one
    //    $user = User::updateOrCreate([
    //        'email' => $googleUser->email,
    //    ], [
    //        'name' => $googleUser->name,
    //        // Other fields like avatar etc.
    //    ]);
    //    // Log the user in or issue a token
    //    // For example, using Laravel Sanctum to issue a token
    //    $token = $user->createToken('YourAppName')->plainTextToken;
    //    return response()->json(['token' => $token]);
   }
}
