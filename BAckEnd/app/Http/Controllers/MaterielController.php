<?php

namespace App\Http\Controllers;

use App\Models\Materiel;
use App\Rules\StatusMaterielRule;
use App\Rules\TypeMaterielRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;

class MaterielController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $materiaux = Materiel::all();
            return response()->json($materiaux);
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
                    'name' => 'required|string|max:255',
                    'type' => ['required', new TypeMaterielRule()],
                    'status' => ['required', new StatusMaterielRule()],
                    'purchaseDate' => 'required|date',
                    'cost' => 'required|numeric',
                    'supplier' => 'required|string|max:255',
                    'technicalSpecifications' => 'required|file|mimes:pdf|max:2048',
                    'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                if ($request->hasFile('image')) {
                    $fileName = time() . $request->file('image')->getClientOriginalName();
                    $request->image->move(public_path('MaterielPictures'), $fileName);

                    $docName = time() . $request->file('technicalSpecifications')->getClientOriginalName();
                    $request->technicalSpecifications->move(public_path('MaterielDocs'), $docName);

                    $materiel = Materiel::create([
                        'name' => $request->input('name'),
                        'type' => $request->input('type'),
                        'status' => $request->input('status'),
                        'purchaseDate' => $request->input('purchaseDate'),
                        'cost' => $request->input('cost'),
                        'supplier' => $request->input('supplier'),
                        'technicalSpecifications' => $docName,
                        'image' => $fileName,
                    ]);

                    return response()->json($materiel, 201);
                } else {
                    return response()->json(['error' => 'File not provided or missing.'], 400);
                }
            } catch (\Exception $e) {
                // Log the error for debugging
                \Log::error('Error uploading file: ' . $e->getMessage());
                // Respond with a generic error message
                return response()->json(['error' => 'An error occurred while uploading the file.'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $materiel = Materiel::find($id);
            if (!$materiel) {
                return response()->json(['error' => 'Materiel avec cette ID non trouvé !'], 404);
            }
            return response()->json($materiel);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {

        if ($this->list_roles->contains(auth()->user()->role)) {
            $materiel = Materiel::find($id);
            if (!$materiel) {
                return response()->json(['error' => 'Materiel avec cette ID non trouvé !'], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'type' => ['required', new TypeMaterielRule()],
                'status' => ['required', new StatusMaterielRule()],
                'purchaseDate' => 'required|date',
                'cost' => 'required|numeric',
                'supplier' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }

            // Handling image upload
            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                $oldImagePath = public_path('MaterielPictures/' . $materiel->image);
                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                }

                $fileImgName = time() . $request->file('image')->getClientOriginalName();
                $request->image->move(public_path('MaterielPictures'), $fileImgName);
                $materiel->image = $fileImgName;
            }

            // Handling technicalSpecifications upload
            if ($request->file('technicalSpecifications') && $request->hasFile('technicalSpecifications') && $request->file('technicalSpecifications')->isValid()) {
                $oldDocPath = public_path('MaterielDocs/' . $materiel->technicalSpecifications);
                if (File::exists($oldDocPath)) {
                    File::delete($oldDocPath);
                }

                $docName = time() . $request->file('technicalSpecifications')->getClientOriginalName();
                $request->technicalSpecifications->move(public_path('MaterielDocs'), $docName);
                $materiel->technicalSpecifications = $docName;
            }

            // Update other fields
            $materiel->name = $request->input('name');
            $materiel->type = $request->input('type');
            $materiel->status = $request->input('status');
            $materiel->purchaseDate = $request->input('purchaseDate');
            $materiel->cost = $request->input('cost');
            $materiel->supplier = $request->input('supplier');

            $materiel->save();

            return response()->json($materiel, 200);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $materiel = Materiel::find($id);
            if (!$materiel) {
                return response()->json(['error' => 'Materiel avec cette ID non trouvé !'], 404);
            }

            $oldImagePath = public_path('MaterielPictures/' . $materiel->image);
            if (File::exists($oldImagePath)) {
                File::delete($oldImagePath);
            }

            $materiel->delete();
            return response()->json(['message' => 'Materiel supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function duplicate($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $originalRow = Materiel::find($id);
            if (!$originalRow) {
                return response()->json(['error' => 'Materiel avec cette ID non trouvé !'], 404);
            }

            $duplicateRow = $originalRow->replicate();
            $duplicateRow->save();

            return response()->json(['message' => 'Materiel dupliqué avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

    }
}
