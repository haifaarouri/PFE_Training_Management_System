<?php

namespace App\Http\Controllers;

use App\Models\Candidat;
use App\Models\Formation;
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

            $candidats = Candidat::with('formations')->get();

            return response()->json($candidats, );
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
                    'address' => 'required|string|max:255',
                    'type' => ['required', new CandidatTypeRule()],
                    'companyName' => 'string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $candidat = Candidat::create([
                    'firstName' => $request->input('firstName'),
                    'lastName' => $request->input('lastName'),
                    'email' => $request->input('email'),
                    'phoneNumber' => $request->input('phoneNumber'),
                    'address' => $request->input('address'),
                    'type' => $request->input('type'),
                    'companyName' => $request->input('companyName'),
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
                    'address' => 'required|string|max:255',
                    'type' => ['required', new CandidatTypeRule()],
                    'companyName' => 'string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $candidat->firstName = $request->input('firstName');
                $candidat->lastName = $request->input('lastName');
                $candidat->email = $request->input('email');
                $candidat->type = $request->input('type');
                $candidat->phoneNumber = $request->input('phoneNumber');
                $candidat->address = $request->input('address');
                $candidat->companyName = $request->input('companyName');
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

    public function registerToFormation(Request $request, $candidatId, $formationId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $candidat = Candidat::find($candidatId);
        $formation = Formation::find($formationId);

        if (!$candidat) {
            return response()->json(['error' => 'Candidat non trouvé !'], 404);
        }

        if (!$formation) {
            return response()->json(['error' => 'Formation non trouvée !'], 404);
        }

        try {
            $attributes = [
                'registerDate' => $request->registerDate,
                'registerStatus' => $request->registerStatus,
                'motivation' => $request->motivation,
                'paymentMethod' => $request->paymentMethod
            ];
            $candidat->formations()->attach($formationId, $attributes);
            return response()->json(['message' => 'Candidat inscrit à la formation avec succès !']);
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) {
                return response()->json(['error' => 'Ce candidat est déjà inscrit à cette formation !'], 400);
            }
            return response()->json(['error' => 'Erreur lors de l\'inscription du candidat à la formation.'], 500);
        } catch (\Exception $e) {
            \Log::error('Error attaching candidat to formation: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'inscription du candidat à la formation.'], 500);
        }
    }

    public function updateRegisterStatus($candidatId, $formationId, Request $request)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $candidat = Candidat::find($candidatId);
        $status = $request->input('registerStatus');

        if ($candidat) {
            $candidat->formations()->updateExistingPivot($formationId, ['registerStatus' => $status]);
            return response()->json(['message' => 'Statut d\'inscription est modifié avec succès !']);
        }

        return response()->json(['error' => 'Candidat non trouvé !'], 404);
    }
}
