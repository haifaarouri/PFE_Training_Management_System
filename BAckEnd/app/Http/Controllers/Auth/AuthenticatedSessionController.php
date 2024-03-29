<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): Response|JsonResponse
    {
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser && $existingUser->provider == 'google') {
            return response()->json(['error' => 'Cet e-mail utilise une autre méthode d\'authentification'], 401);
        }

        if ($existingUser && !$existingUser->isActive) {
            return response()->json(['error' => 'Ce compte n\'est pas actif ! Vous n\'avez pas d\'accès à notre application !'], 401);
        }

        $request->authenticate();

        $request->session()->regenerate();

        return response()->noContent();
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
