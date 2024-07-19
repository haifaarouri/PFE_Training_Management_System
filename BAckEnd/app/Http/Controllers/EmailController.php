<?php

namespace App\Http\Controllers;

use App\Mail\AssignRoleToUserEmail;
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

    public function sendEmailAssignRole(Request $request, $email)
    {
        if (auth()->user()->role === 'SuperAdmin') {

            $request->validate([
                'role' => 'required|string|in:PiloteDuProcessus,Sales,ChargéFormation,AssistanceAcceuil,CommunityManager,ServiceFinancier', 
            ]);

            $user = User::where('email', $email)->first();

            if (!$user) {
                return response()->json(['error' => 'Administateur non trouvé avec cet e-mail !'], 404);
            }

            $user->update([
                'role' => $request->input('role'),
            ]);

            Mail::to($user->email)->send(new AssignRoleToUserEmail($user));

            return response()->json(['message' => 'Role assigné à l\'administrateur avec succès !']);
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
}
