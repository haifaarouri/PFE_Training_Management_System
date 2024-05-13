<?php

namespace App\Http\Controllers;

use App\Models\Candidat;
use App\Rules\CandidatTypeRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CandidatController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $candidats = Candidat::all();
            return response()->json($candidats);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function store(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {

                $validator = Validator::make($request->all(), [
                    'firstName' => 'required|string|max:255',
                    'lastName' => 'required|string|max:255',
                    'email' => 'required|string|email|unique:Candidats|max:255',
                    'phoneNumber' => 'required|string|max:255|min:8',
                    'type' => ['required', new CandidatTypeRule()],
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $candidat = Candidat::create([
                    'firstName' => $request->input('firstName'),
                    'lastName' => $request->input('lastName'),
                    'email' => $request->input('email'),
                    'phoneNumber' => $request->input('phoneNumber'),
                    'type' => $request->input('type'),
                ]);

                return response()->json($candidat, 201);
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de l\'ajout du Candidat !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $candidat = Candidat::find($id);
            if (!$candidat) {
                return response()->json(['error' => 'Candidat avec cette ID non trouvé !'], 404);
            }
            return response()->json($candidat);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {

        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $candidat = Candidat::find($id);
                if (!$candidat) {
                    return response()->json(['error' => 'Candidat avec cette ID non trouvé !'], 404);
                }

                $validator = Validator::make($request->all(), [
                    'firstName' => 'required|string|max:255',
                    'lastName' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255',
                    'phoneNumber' => 'required|string|max:255|min:8',
                    'type' => ['required', new CandidatTypeRule()],
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $candidat->firstName = $request->input('firstName');
                $candidat->lastName = $request->input('lastName');
                $candidat->email = $request->input('email');
                $candidat->type = $request->input('type');
                $candidat->phoneNumber = $request->input('phoneNumber');
                $candidat->save();

                return response()->json($candidat, 200);
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de la mise à jour du Candidat !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $candidat = Candidat::find($id);
            if (!$candidat) {
                return response()->json(['error' => 'Candidat avec cette ID non trouvé !'], 404);
            }

            $candidat->delete();
            return response()->json(['message' => 'Candidat supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

}
