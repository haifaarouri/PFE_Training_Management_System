<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Formation;
use App\Models\SousCategorie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FormationController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $formations = Formation::with('sousCategorie.categorie')->get();
            return response()->json($formations);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function getAllCategories()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $categories = Categorie::all();
            return response()->json($categories);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function store(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'required|string',
                    'personnesCible' => 'required|string|max:255',
                    'price' => 'required|numeric',
                    'categorie_name' => 'required|string|max:255',
                    'sous_categorie_name' => 'required|string|max:255',
                ]);

                // Create or find the category
                $categorie = Categorie::firstOrCreate([
                    'categorie_name' => $request->input('categorie_name')
                ]);

                // Create or find the subcategory within the found/created category
                $sousCategorie = $categorie->sousCategories()->firstOrCreate([
                    'sous_categorie_name' => $request->input('sous_categorie_name')
                ]);

                $requirements = [];
                foreach (json_decode($request->input('requirements'), true) as $key => $value) {
                    $requirements[$key] = $value;
                }

                $requirementsStr = implode(',', $requirements);

                // Create the formation within the found/created subcategory
                $formation = $sousCategorie->formations()->create([
                    'name' => $request->input('name'),
                    'description' => $request->input('description'),
                    'personnesCible' => $request->input('personnesCible'),
                    'price' => $request->input('price'),
                    'requirements' => $requirementsStr,
                ]);

                return response()->json($formation, 201);

            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                dd($e->getMessage());
                return response()->json(['error' => 'Erreur lors de l\'ajout de la formation !'], 500);
            }
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $formation = Formation::with('sousCategorie.categorie')->find($id);
            if (!$formation) {
                return response()->json(['error' => 'formation avec cette ID non trouvé !'], 404);
            }
            return response()->json($formation);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function sousCategoriesOfSpecificaCategory($category_id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $sousCategories = SousCategorie::where('categorie_id', '=', $category_id)->get();
            if (!$sousCategories) {
                return response()->json(['error' => 'Pas de sous categories pour cette categorie !'], 404);
            }
            return response()->json($sousCategories);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $formation = Formation::find($id);
                if (!$formation) {
                    return response()->json(['error' => 'Formation with this ID not found!'], 404);
                }

                $validator = Validator::make($request->all(), [
                    'name' => 'required|string|max:255',
                    'description' => 'required|string',
                    'personnesCible' => 'required|string|max:255',
                    'price' => 'required|numeric',
                    'categorie_name' => 'required|string|max:255',
                    'sous_categorie_name' => 'required|string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $categorie = Categorie::firstOrCreate([
                    'categorie_name' => $request->input('categorie_name')
                ]);

                $sousCategorie = $categorie->sousCategories()->firstOrCreate([
                    'sous_categorie_name' => $request->input('sous_categorie_name')
                ]);

                $formation->update([
                    'name' => $request->input('name'),
                    'description' => $request->input('description'),
                    'personnesCible' => $request->input('personnesCible'),
                    'price' => $request->input('price'),
                    'sous_categorie_id' => $sousCategorie->id,
                ]);

                return response()->json($formation, 200);
            } catch (\Exception $e) {
                \Log::error('Error updating formation: ' . $e->getMessage());
                return response()->json(['error' => 'Error updating the formation!'], 500);
            }
        } else {
            return response()->json(['error' => "You do not have access to this route!"], 403);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $formation = Formation::find($id);
            if (!$formation) {
                return response()->json(['error' => 'Formation avec cette ID non trouvé !'], 404);
            }

            $formation->delete();
            return response()->json(['message' => 'Formation supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

}
