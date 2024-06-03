<?php

namespace App\Http\Controllers;

use App\Models\DocumentTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class DocumentTemplateController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $documentTemplates = DocumentTemplate::all();

            return response()->json($documentTemplates, );
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

        $request->validate([
            'type' => 'required|string|max:255',
            'docName' => 'required|file|max:2048'
        ]);

        $template = new DocumentTemplate();
        $template->type = $request->type;

        if ($request->file('docName')) {
            $fileName = time() . '_' . $request->file('docName')->getClientOriginalName();
            $request->docName->move(public_path('documentTemplates'), $fileName);
            $template->docName = $fileName;
        }

        $template->save();

        return response()->json(['message' => 'Modèle du document enregistré avec succès !'], 201);
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $documentTemplate = DocumentTemplate::find($id);
            if (!$documentTemplate) {
                return response()->json(['error' => 'Modèle du document avec cette ID non trouvé !'], 404);
            }
            return response()->json($documentTemplate);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $documentTemplate = DocumentTemplate::find($id);
                if (!$documentTemplate) {
                    return response()->json(['error' => 'Modèle du document avec cette ID non trouvé !'], 404);
                }

                $validator = Validator::make($request->all(), [
                    'type' => 'required|string|max:255',
                    'docName' => 'required|max:2048'
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $documentTemplate->type = $request->type;

                if ($request->file('docName') && $request->hasFile('docName') && $request->file('docName')->isValid()) {

                    $oldPath = public_path('documentTemplates/' . $documentTemplate->docName);
                    if (File::exists($oldPath)) {
                        File::delete($oldPath);
                    }

                    $fileName = time() . '_' . $request->file('docName')->getClientOriginalName();
                    $request->docName->move(public_path('documentTemplates'), $fileName);

                    $documentTemplate->docName = $fileName;
                }
                \Log::info($documentTemplate);
                $documentTemplate->save();

                return response()->json($documentTemplate, 200);
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                dd($e->getMessage());
                return response()->json(['error' => 'Erreur lors de la mise à jour du modèle du document !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $documentTemplate = DocumentTemplate::find($id);
            if (!$documentTemplate) {
                return response()->json(['error' => 'Modèle du document avec cette ID non trouvé !'], 404);
            }

            $oldPath = public_path('documentTemplates/' . $documentTemplate->docName);
            if (File::exists($oldPath)) {
                File::delete($oldPath);
            }

            $documentTemplate->delete();
            return response()->json(['message' => 'Modèle du document supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

}
