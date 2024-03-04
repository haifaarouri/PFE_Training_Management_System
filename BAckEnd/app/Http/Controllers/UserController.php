<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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

    // public function store(Request $request)
    // {
    //     User::create($request->all());
    //     return redirect()->route('your.index');
    // }

    public function update(Request $request, $id)
    {
        // $user = User::find($id);
        // $user->update($request->all());
        // return response()->json('User updated');
        $user = User::findOrFail($id);
dd($request->all());
        // if (!$user) {
        //     return response()->json(['error' => "Pas d'administrateur avec cet ID !"], 404);
        // } else {
        //     $request->validate([
        //         'firstName' => 'required|string|max:255',
        //         'lastName' => 'required|string|max:255',
        //         'phoneNumber' => 'required|string|max:255',
        //         'email' => 'required|string|email|max:255',
        //         'profileImage' => 'required|max:2048',
        //         'role' => 'required|string|max:255'
        //     ]);

        //     if ($request->hasFile('profileImage')) {
        //         $fileName = time() . $request->file('profileImage')->getClientOriginalName();
        //         $request->profileImage->move(public_path('profilePictures'), $fileName);

        //         $user->firstName = $request->input('firstName');
        //         $user->lastName = $request->input('lastName');
        //         $user->email = $request->input('email');
        //         $user->phoneNumber = $request->input('phoneNumber');
        //         $user->profileImage = $fileName;
        //         $user->role = $request->input('role');
        //         $user->password = Hash::make($request->input('firstName') . '-' . $request->input('lastName') . '-' . $request->input('role'));

        //         $user->save();
        //         return response()->json(['message' => 'User updated successfully']);
        //     } else {
        //         $user->firstName = $request->input('firstName');
        //         $user->lastName = $request->input('lastName');
        //         $user->email = $request->input('email');
        //         $user->phoneNumber = $request->input('phoneNumber');
        //         $user->profileImage = $request->input('profileImage');
        //         $user->role = $request->input('role');
        //         $user->password = Hash::make($request->input('firstName') . '-' . $request->input('lastName') . '-' . $request->input('role'));

        //         $user->save();
        //         return response()->json(['message' => 'User updated successfully']);
        //     }
        // }
    }

    // public function destroy($id)
    // {
    //     User::findOrFail($id)->delete();
    //     return redirect()->route('your.index');
    // }
}
