<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'phoneNumber' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'profileImage' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('profileImage')) {
            $fileName = time() . $request->file('profileImage')->getClientOriginalName();
            $request->profileImage->move(public_path('profilePictures'), $fileName);

            $user = User::create([
                'firstName' => $request->firstName,
                'lastName' => $request->lastName,
                'email' => $request->email,
                'phoneNumber' => $request->phoneNumber,
                'profileImage' => $fileName,
                'password' => Hash::make($request->password),
            ]);

            event(new Registered($user));

            Auth::login($user);

            return response()->noContent();
        }
    }
}
