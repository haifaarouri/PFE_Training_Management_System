<?php

namespace App\Http\Controllers;

use App\Mail\ChangeIsActiveEmail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    public function show(Request $request)
    {   
        $user = $request->user()->load('notifications');
        return response()->json($user);
    }

    public function getUserById($id)
    {
        // Check if the authenticated user has the 'SuperAdmin' role
        if (auth()->user()->role === 'SuperAdmin') {
            // Find the user by ID
            $user = User::find($id);

            if (!$user) {
                // User not found, return a 404 response
                return response()->json(['error' => "Pas d'administrateur avec cet ID !"], 404);
            }

            // Return the user data
            return response()->json($user);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function getUserByEmail($email)
    {
        $user = User::firstWhere('email', $email);


        if (!$user) {
            return response()->json(['error' => "Pas d'administrateur avec cet E-mail !"], 404);
        }

        return response()->json($user);
    }

    public function index()
    {
        if (auth()->user()->role === 'SuperAdmin') {
            $users = User::all();
            return response()->json($users);
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function store(Request $request)
    {
        if (auth()->user()->role === 'SuperAdmin') {
            $request->validate([
                'firstName' => 'required|string|max:255',
                'lastName' => 'required|string|max:255',
                'phoneNumber' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'profileImage' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'role' => 'required|string|max:255'
            ]);

            if ($request->hasFile('profileImage')) {
                $fileName = time() . $request->file('profileImage')->getClientOriginalName();
                $request->profileImage->move(public_path('profilePictures'), $fileName);

                $user = User::create([
                    'firstName' => $request->input('firstName'),
                    'lastName' => $request->input('lastName'),
                    'email' => $request->input('email'),
                    'phoneNumber' => $request->input('phoneNumber'),
                    'profileImage' => $fileName,
                    'role' => $request->input('role'),
                    'password' => Hash::make($request->input('firstName') . '-' . $request->input('lastName') . '-' . $request->input('role')),
                ]);

                return $user;
            }
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {
        if (auth()->user()->role === 'SuperAdmin') {
            $user = User::findOrFail($id);

            if (!$user) {
                return response()->json(['error' => "Pas d'administrateur avec cet ID !"], 404);
            } else {
                $request->validate([
                    'firstName' => 'required|string|max:255',
                    'lastName' => 'required|string|max:255',
                    'phoneNumber' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255',
                    'role' => 'required|string|max:255'
                ]);

                if ($request->file('profileImage') && $request->file('profileImage')->isValid()) {

                    $oldImagePath = public_path('profilePictures/' . $request->profileImage);
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                    }

                    $fileName = time() . $request->file('profileImage')->getClientOriginalName();
                    $request->profileImage->move(public_path('profilePictures'), $fileName);

                    $user->firstName = $request->input('firstName');
                    $user->lastName = $request->input('lastName');
                    $user->email = $request->input('email');
                    $user->phoneNumber = $request->input('phoneNumber');
                    $user->profileImage = $fileName;
                    $user->role = $request->input('role');

                    $user->save();
                    return $user;
                } else {
                    $user->firstName = $request->input('firstName');
                    $user->lastName = $request->input('lastName');
                    $user->email = $request->input('email');
                    $user->phoneNumber = $request->input('phoneNumber');
                    $user->profileImage = $request->input('profileImage');
                    $user->role = $request->input('role');

                    $user->save();
                    return $user;
                }
            }
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function destroy($id)
    {
        if (auth()->user()->role === 'SuperAdmin') {
            $user = User::findOrFail($id);

            $user->delete();

            $oldImagePath = public_path('profilePictures/' . $user->profileImage);
            if (File::exists($oldImagePath)) {
                File::delete($oldImagePath);
            }
            return response()->json(['message' => 'Administrateur supprimé avec succès !']);
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function updateProfile(Request $request, $id)
    {
        if (auth()->user()) {
            $user = User::findOrFail($id);

            if (!$user) {
                return response()->json(['error' => "Pas d'administrateur avec cet ID !"], 404);
            } else {
                $request->validate([
                    'firstName' => 'required|string|max:255',
                    'lastName' => 'required|string|max:255',
                    'phoneNumber' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255',
                    'password' => 'required|string|min:8|confirmed',
                ]);

                if ($request->file('profileImage') && $request->file('profileImage')->isValid()) {

                    $oldImagePath = public_path('profilePictures/' . $request->profileImage);
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                    }

                    $fileName = time() . $request->file('profileImage')->getClientOriginalName();
                    $request->profileImage->move(public_path('profilePictures'), $fileName);

                    $user->firstName = $request->input('firstName');
                    $user->lastName = $request->input('lastName');
                    $user->email = $request->input('email');
                    $user->phoneNumber = $request->input('phoneNumber');
                    $user->profileImage = $fileName;
                    $user->password = Hash::make($request->input('password'));

                    $user->save();
                    return response()->json(['message' => 'Votre Profil est modifié avec succès !']);
                } else {
                    $user->firstName = $request->input('firstName');
                    $user->lastName = $request->input('lastName');
                    $user->email = $request->input('email');
                    $user->phoneNumber = $request->input('phoneNumber');
                    $user->profileImage = $request->input('profileImage');
                    $user->password = Hash::make($request->input('password'));

                    $user->save();
                    return response()->json(['message' => 'Votre Profil est modifié avec succès !']);
                }
            }
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function logoutFromGoogle(Request $request)
    {
        if (auth()->user()) {
            // Revoke the token that was used to authenticate the current request...
            $request->user()->currentAccessToken()->delete();

            return response()->json(['message' => "Vous avez déconnecté avec succès !"]);
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function updateIsActive(Request $request, $id)
    {
        if (auth()->user()->role === 'SuperAdmin') {

            $user = User::find($id);

            if ($user->isActive) {
                $user->isActive = 0;
                $user->save();
                Mail::to($user->email)->send(new ChangeIsActiveEmail($request->causes, $user));
                return response()->json(['message' => 'Compte désactivé avec succès !']);
            } else {
                $user->isActive = 1;
                $user->save();
                Mail::to($user->email)->send(new ChangeIsActiveEmail($request->causes, $user));
                return response()->json(['message' => 'Compte activé avec succès !']);
            }
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
}
