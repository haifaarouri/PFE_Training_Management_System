<?php

namespace App\Http\Controllers;

use App\Models\Partenaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PartenaireController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $partenaires = Partenaire::all();
            return response()->json($partenaires);
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
                    'companyName' => 'required|string|max:255',
                    'contactName' => 'required|string|max:255',
                    'email' => 'required|string|unique:Partenaires|max:255',
                    'phoneNumber' => 'required|string|max:255|min:8',
                    'fax' => 'required|string|max:255',
                    'webSite' => 'required|string|max:255',
                    'adresse' => 'required|string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $partenaire = Partenaire::create([
                    'companyName' => $request->input('companyName'),
                    'contactName' => $request->input('contactName'),
                    'email' => $request->input('email'),
                    'phoneNumber' => $request->input('phoneNumber'),
                    'fax' => $request->input('fax'),
                    'webSite' => $request->input('webSite'),
                    'adresse' => $request->input('adresse')
                ]);

                return response()->json($partenaire, 201);
            } catch (\Exception $e) {
                \Log::error('Error: ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de l\'ajout du Partenaire !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $partenaire = Partenaire::find($id);
            if (!$partenaire) {
                return response()->json(['error' => 'Partenaire avec cette ID non trouvé !'], 404);
            }
            return response()->json($partenaire);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {

        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $partenaire = Partenaire::find($id);
                if (!$partenaire) {
                    return response()->json(['error' => 'Partenaire avec cette ID non trouvé !'], 404);
                }

                $validator = Validator::make($request->all(), [
                    'companyName' => 'required|string|max:255',
                    'contactName' => 'required|string|max:255',
                    'email' => 'required|string|unique:Partenaires|max:255',
                    'phoneNumber' => 'required|string|max:255|min:8',
                    'fax' => 'required|string|max:255r',
                    'webSite' => 'required|string|max:255',
                    'adresse' => 'required|string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $partenaire->companyName = $request->input('companyName');
                $partenaire->contactName = $request->input('contactName');
                $partenaire->email = $request->input('email');
                $partenaire->phoneNumber = $request->input('phoneNumber');
                $partenaire->fax = $request->input('fax');
                $partenaire->webSite = $request->input('webSite');
                $partenaire->adresse = $request->input('adresse');
                $partenaire->save();

                return response()->json($partenaire, 200);
            } catch (\Exception $e) {
                \Log::error('Error uploading file: ' . $e->getMessage());
                dd($e->getMessage());
                return response()->json(['error' => 'Erreur lors de la mise à jour du Partenaire !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $partenaire = Partenaire::find($id);
            if (!$partenaire) {
                return response()->json(['error' => 'Partenaire avec cette ID non trouvé !'], 404);
            }

            $partenaire->delete();
            return response()->json(['message' => 'Partenaire supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
}
