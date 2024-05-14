<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Formation;
use App\Models\JourFormation;
use App\Models\ProgrammeFormation;
use App\Models\SousCategorie;
use App\Models\SousPartie;
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

            $formations = Formation::with('sousCategorie.categorie', 'programme', 'programme.jourFormations', 'programme.jourFormations.sousParties')->get();
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
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        if (is_string($request->input('programme'))) {
            $programme = json_decode($request->input('programme'), true);
            $request->merge(['programme' => $programme]);
        }

        $validator = Validator::make($request->all(), [
            'reference' => 'required|string|max:255',
            'entitled' => 'required|string|max:255',
            'description' => 'required|string',
            'numberOfDays' => 'required|integer',
            'personnesCible' => 'required|string|max:255',
            'price' => 'required|numeric',
            'certificationOrganization' => 'required|string|max:255',
            'courseMaterial' => 'required|file|mimes:pdf|max:2048',
            'categorie_name' => 'required|string|max:255',
            'sous_categorie_name' => 'required|string|max:255',
            'programme' => 'required|array',
            'programme.title' => 'required|string',
            'programme.jours' => 'required|array',
            'programme.jours.*.dayName' => 'required|string',
            'programme.jours.*.sousParties' => 'required|array',
            'programme.jours.*.sousParties.*.description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        try {
            $categorie = Categorie::firstOrCreate(['categorie_name' => $request->input('categorie_name')]);
            $sousCategorie = $categorie->sousCategories()->firstOrCreate(['sous_categorie_name' => $request->input('sous_categorie_name')]);

            $requirements = [];
            foreach (json_decode($request->input('requirements'), true) as $key => $value) {
                $requirements[$key] = $value;
            }

            $requirementsStr = implode(',', $requirements);

            if ($request->hasFile('courseMaterial')) {
                $fileName = time() . $request->file('courseMaterial')->getClientOriginalName();
                $request->courseMaterial->move(public_path('CoursesMaterials'), $fileName);

                $formation = $sousCategorie->formations()->create([
                    'reference' => $request->input('reference'),
                    'entitled' => $request->input('entitled'),
                    'numberOfDays' => $request->input('numberOfDays'),
                    'description' => $request->input('description'),
                    'personnesCible' => $request->input('personnesCible'),
                    'price' => $request->input('price'),
                    'requirements' => $requirementsStr,
                    'certificationOrganization' => $request->input('certificationOrganization'),
                    'courseMaterial' => $fileName,
                ]);

                $programmeData = $request->input('programme');

                $programme = $formation->programme()->create([
                    'title' => $programmeData['title']
                ]);

                foreach ($programmeData['jours'] as $jourData) {
                    $jour = $programme->jourFormations()->create([
                        'dayName' => $jourData['dayName']
                    ]);

                    foreach ($jourData['sousParties'] as $sousPartieData) {
                        $jour->sousParties()->create([
                            'description' => $sousPartieData['description']
                        ]);
                    }
                }

                return response()->json($formation, 201);
            }
        } catch (\Exception $e) {
            \Log::error('Error : ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'ajout de la formation !'], 500);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $formation = Formation::with('sousCategorie.categorie', 'programme', 'programme.jourFormations', 'programme.jourFormations.sousParties')->find($id);
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
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        if (is_string($request->input('programme'))) {
            $programme = json_decode($request->input('programme'), true);
            $request->merge(['programme' => $programme]);
        }

        $validator = Validator::make($request->all(), [
            'reference' => 'required|string|max:255',
            'entitled' => 'required|string|max:255',
            'description' => 'required|string',
            'numberOfDays' => 'required|integer',
            'personnesCible' => 'required|string|max:255',
            'price' => 'required|numeric',
            'certificationOrganization' => 'required|string|max:255',
            'categorie_name' => 'required|string|max:255',
            'sous_categorie_name' => 'required|string|max:255',
            'programme' => 'required|array',
            'programme.title' => 'required|string',
            'programme.jour_formations' => 'required|array',
            'programme.jour_formations.*.dayName' => 'required|string',
            'programme.jour_formations.*.sous_parties' => 'required|array',
            'programme.jour_formations.*.sous_parties.*.description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        try {
            $formation = Formation::find($id);
            if (!$formation) {
                return response()->json(['error' => 'Formation not found!'], 404);
            }

            $requirements = [];
            foreach (json_decode($request->input('requirements'), true) as $key => $value) {
                $requirements[$key] = $value;
            }

            $requirementsStr = implode(',', $requirements);

            $formation->update([
                'reference' => $request->input('reference'),
                'entitled' => $request->input('entitled'),
                'numberOfDays' => $request->input('numberOfDays'),
                'description' => $request->input('description'),
                'personnesCible' => $request->input('personnesCible'),
                'price' => $request->input('price'),
                'requirements' => $requirementsStr,
                'certificationOrganization' => $request->input('certificationOrganization'),
                'courseMaterial' => $request->input('courseMaterial'),
            ]);

            if ($request->hasFile('courseMaterial')) {
                $fileName = time() . $request->file('courseMaterial')->getClientOriginalName();
                $request->file('courseMaterial')->move(public_path('CoursesMaterials'), $fileName);
                $formation->courseMaterial = $fileName;
                $formation->save();
            }

            // Update Programme
            $programmeData = $request->input('programme');
            $programme = $formation->programme()->updateOrCreate(
                ['formation_id' => $formation->id],
                ['title' => $programmeData['title']]
            );

            // Update JourFormations and SousParties
            foreach ($programmeData['jour_formations'] as $jourData) {
                $jour = $programme->jourFormations()->updateOrCreate(
                    ['programme_formation_id' => $programme->id, 'dayName' => $jourData['dayName']],
                    ['dayName' => $jourData['dayName']]
                );

                foreach ($jourData['sous_parties'] as $sousPartieData) {
                    $jour->sousParties()->updateOrCreate(
                        ['jour_formation_id' => $jour->id, 'description' => $sousPartieData['description']],
                        ['description' => $sousPartieData['description']]
                    );
                }
            }

            return response()->json($formation, 200);
        } catch (\Exception $e) {
            \Log::error('Error updating formation: ' . $e->getMessage());
            return response()->json(['error' => 'Error updating the formation!'], 500);
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

    public function getFormationByRef($ref)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $formation = Formation::firstWhere('reference', $ref);
            if (!$formation) {
                return response()->json(['error' => 'Formation avec cette réference non trouvée !'], 404);
            }
            return response()->json($formation);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

}
