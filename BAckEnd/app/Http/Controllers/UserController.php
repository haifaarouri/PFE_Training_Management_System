<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

class UserController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function getUserById($id)
    {
        $user = User::findOrFail($id);

        if (!$user) {
            return response()->json(['error' => "Pas d'administrateur avec cet ID !"], 404);
        }
        return response()->json($user);
    }

    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function store(Request $request)
    {
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
                'firstName' => $request->firstName,
                'lastName' => $request->lastName,
                'email' => $request->email,
                'phoneNumber' => $request->phoneNumber,
                'profileImage' => $fileName,
                'role' => $request->role,
                'password' => Hash::make($request->input('firstName') . '-' . $request->input('lastName') . '-' . $request->input('role')),
            ]);

            return response()->json(['message' => 'Administareur ajouté avec succès !']);
        }
    }

    public function update(Request $request, $id)
    {
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
                $user->password = Hash::make($request->input('firstName') . '-' . $request->input('lastName') . '-' . $request->input('role'));

                $user->save();
                return response()->json(['message' => 'Administrateur modifié avec succès !']);
            } else {
                $user->firstName = $request->input('firstName');
                $user->lastName = $request->input('lastName');
                $user->email = $request->input('email');
                $user->phoneNumber = $request->input('phoneNumber');
                $user->profileImage = $request->input('profileImage');
                $user->role = $request->input('role');
                $user->password = Hash::make($request->input('firstName') . '-' . $request->input('lastName') . '-' . $request->input('role'));

                $user->save();
                return response()->json(['message' => 'Administrateur modifié avec succès !']);
            }
        }
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        $user->delete();

        $oldImagePath = public_path('profilePictures/' . $user->profileImage);
        if (File::exists($oldImagePath)) {
            File::delete($oldImagePath);
        }
        return response()->json(['message' => 'Administrateur supprimé avec succès !']);
    }
}
