<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Formation;
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

    public function store(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'required|string',
                    'personnesCible' => 'required|string|max:255',
                    'price' => 'required|numeric',
                    'requirements' => 'required|string|max:255',
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

                // Create the formation within the found/created subcategory
                $formation = $sousCategorie->formations()->create([
                    'name' => $request->input('name'),
                    'description' => $request->input('description'),
                    'personnesCible' => $request->input('personnesCible'),
                    'price' => $request->input('price'),
                    'requirements' => $request->input('requirements'),
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
            $formation = Formation::findOrFail($id);
            if (!$formation) {
                return response()->json(['error' => 'formation avec cette ID non trouvé !'], 404);
            }
            return response()->json($formation);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    // public function update(Request $request, $id)
    // {

    //     if ($this->list_roles->contains(auth()->user()->role)) {
    //         try {
    //             $formation = formation::find($id);
    //             if (!$formation) {
    //                 return response()->json(['error' => 'formation avec cette ID non trouvé !'], 404);
    //             }

    //             $validator = Validator::make($request->all(), [
    //                 'firstName' => 'required|string|max:255',
    //                 'lastName' => 'required|string|max:255',
    //                 'email' => 'required|string|max:255',
    //                 'phoneNumber' => 'required|string|max:255|min:8',
    //                 'experience' => 'required|integer',
    //                 'type' => ['required', new TypeformationRule()],
    //             ]);

    //             if ($validator->fails()) {
    //                 return response()->json(['error' => $validator->errors()], 400);
    //             }

    //             if ($request->has('certificates') && is_array($request->input('certificates'))) {
    //                 foreach ($request->input('certificates') as $certificate) {
    //                     $validator = Validator::make($certificate, [
    //                         'name' => 'required|string|max:255',
    //                         'organisme' => 'required|string|max:255',
    //                         'obtainedDate' => 'required|date',
    //                         'idCertificat' => 'nullable',
    //                         'urlCertificat' => 'nullable',
    //                     ]);

    //                     if ($validator->fails()) {
    //                         return response()->json(['error' => $validator->errors()], 400);
    //                     }

    //                     // Update certificates
    //                     $incomingCertificates = $request->input('certificates', []);
    //                     $currentCertificates = $formation->certificats()->get()->keyBy('id');

    //                     foreach ($incomingCertificates as $certificateData) {
    //                         $certificateId = $certificateData['id'] ?? null;
    //                         if ($certificateId && $currentCertificates->has($certificateId)) {
    //                             // Update existing certificate
    //                             $currentCertificates[$certificateId]->update($certificateData);
    //                             $currentCertificates->forget($certificateId); // Remove from the collection to avoid deleting later
    //                         } else {
    //                             // Create new certificate
    //                             $formation->certificats()->create($certificateData);
    //                         }
    //                     }

    //                     // Delete any certificates not included in the incoming data
    //                     foreach ($currentCertificates as $certificate) {
    //                         $certificate->delete();
    //                     }
    //                 }
    //             }

    //             if ($request->has('disponibility') && is_array($request->input('disponibility'))) {

    //                 $incomingDisponibilities = $request->input('disponibility', []);
    //                 $currentDisponibilities = $formation->disponibilities()->get()->keyBy('id');

    //                 foreach ($incomingDisponibilities as $disponibilityData) {
    //                     $disponibilityId = $disponibilityData['id'] ?? null;
    //                     if ($disponibilityId && $currentDisponibilities->has($disponibilityId)) {
    //                         $currentDisponibilities[$disponibilityId]->update($disponibilityData);
    //                         $currentDisponibilities->forget($disponibilityId);
    //                     } else {
    //                         $formation->disponibilities()->create($disponibilityData);
    //                     }
    //                 }

    //                 foreach ($currentDisponibilities as $disponibility) {
    //                     $disponibility->delete();
    //                 }
    //             }

    //             $cvName = null;
    //             if ($request->hasFile('cv')) {
    //                 $cvName = time() . $request->file('cv')->getClientOriginalName();
    //                 $request->cv->move(public_path('TrainersCV'), $cvName);
    //             }

    //             $specialities = [];
    //             foreach (json_decode($request->input('specialities'), true) as $key => $value) {
    //                 $specialities[$key] = $value;
    //             }

    //             $specialitiesStr = implode(',', $specialities);

    //             $formation->firstName = $request->input('firstName');
    //             $formation->lastName = $request->input('lastName');
    //             $formation->email = $request->input('email');
    //             $formation->type = $request->input('type');
    //             $formation->phoneNumber = $request->input('phoneNumber');
    //             $formation->experience = $request->input('experience');
    //             $formation->speciality = $specialitiesStr;
    //             $formation->cv = !empty($cvName) ? $cvName : $request->input('cv');
    //             $formation->save();

    //             return response()->json($formation, 200);
    //         } catch (\Exception $e) {
    //             \Log::error('Error uploading file: ' . $e->getMessage());
    //             dd($e->getMessage());
    //             return response()->json(['error' => 'Erreur lors de la mise à jour du formation !'], 500);
    //         }
    //     } else {
    //         // User does not have access, return a 403 response
    //         return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
    //     }
    // }

    // public function destroy($id)
    // {
    //     if ($this->list_roles->contains(auth()->user()->role)) {
    //         $formation = formation::find($id);
    //         if (!$formation) {
    //             return response()->json(['error' => 'formation avec cette ID non trouvé !'], 404);
    //         }

    //         $formation->delete();
    //         return response()->json(['message' => 'formation supprimée avec succès !']);
    //     } else {
    //         // User does not have access, return a 403 response
    //         return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
    //     }
    // }

}
