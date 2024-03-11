<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Mail\MyEmail;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\UserController;
use App\Mail\EditUserEmail;
use App\Mail\DeleteUserEmail;

class EmailController extends Controller
{
    public function sendEmailAddUser(Request $request) {
        $user = app(UserController::class)->store($request);

        // Send the welcome email
        Mail::to($user->email)->send(new MyEmail($user));

        // Return response
        return response()->json(['message' => 'Administatreur créé avec succès et e-mail envoyé !']);
    }

    public function sendEmailEditUser(Request $request, $id) {
        $user = app(UserController::class)->update($request, $id);

        Mail::to($user->email)->send(new EditUserEmail($user));

        return response()->json(['message' => 'Administrateur modifié avec succès et e-mail envoyé !']);
    }

    public function sendEmailDeteteUser($id) {
        $userToDelete = User::findOrFail($id);

        app(UserController::class)->destroy($id);

        Mail::to($userToDelete->email)->send(new DeleteUserEmail($userToDelete));

        return response()->json(['message' => 'Administrateur supprimé avec succès et e-mail envoyé !']);
    }
}
