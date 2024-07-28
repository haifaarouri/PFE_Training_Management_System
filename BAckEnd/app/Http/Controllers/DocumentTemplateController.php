<?php

namespace App\Http\Controllers;

use App\Models\DocumentLog;
use App\Models\DocumentTemplate;
use App\Models\Formation;
use App\Models\Session;
use App\Models\SousCategorie;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpWord\TemplateProcessor;

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

            $documentTemplates = DocumentTemplate::with('variableTemplates')->get();

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
            'docName' => 'required|file|max:2048',
            'variable_ids' => 'required',
            'variable_ids.*' => 'required|exists:variable_templates,id'
        ]);

        $template = new DocumentTemplate();
        $template->type = $request->type;

        if ($request->file('docName')) {
            $fileName = time() . '_' . $request->file('docName')->getClientOriginalName();
            $request->docName->move(public_path('documentTemplates'), $fileName);
            $template->docName = $fileName;
        }

        $template->save();
        $template->variableTemplates()->attach(json_decode($request->variable_ids, true));

        return response()->json(['message' => 'Modèle du document enregistré avec succès !'], 201);
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $documentTemplate = DocumentTemplate::with('variableTemplates')->find($id);
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
                    'docName' => 'required|max:2048',
                    'variable_ids' => 'required',
                    'variable_ids.*' => 'required|exists:variable_templates,id'
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

                $documentTemplate->save();

                $documentTemplate->variableTemplates()->sync(json_decode($request->variable_ids, true));

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

    public function generateTrainingCatalog($type)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $template = DocumentTemplate::where('type', 'LIKE', '%' . $type . '%')->with('variableTemplates')->first();
        if (!$template) {
            return response()->json(['error' => 'Modèle du document non trouvé !'], 404);
        }

        $originalTemplatePath = public_path('documentTemplates/' . $template->docName);
        $tempTemplatePath = public_path('temp/' . time() . '_' . $template->docName);
        if (!copy($originalTemplatePath, $tempTemplatePath)) {
            \Log::error('Failed to copy template file.');
            throw new \Exception("Failed to copy template file for processing.");
        }

        $templateProcessor = new TemplateProcessor($tempTemplatePath);

        // Fetch formations with their sessions
        $formations = Formation::with('sessions')->get();
        // foreach ($formations as $formation) {
        //     $formationKey = 'formation ' . ($formation->id);
        //     $templateProcessor->setValue('titleFormation', $formation->entitled);
        //     $templateProcessor->setValue('formationRef', $formation->reference);
        //     $templateProcessor->setValue('descriptionFormation', $formation->description);
        //     $templateProcessor->setValue('nombreJourFormation', $formation->numberOfDays);
        
        //     foreach ($formation->sessions as $session) {
        //         $sessionKey = 'session ' . ($session->id);
        //         $templateProcessor->setValue('sessionTitle', $session->title);
        //         $templateProcessor->setValue('dateDébutSession', $session->startDate);
        //         $templateProcessor->setValue('dateFinSession', $session->endDate);
        //     }
        // }
        $formationData = [];
        foreach ($formations as $index => $formation) {
            $formationKey = 'formation ' . ($index + 1);
            $formationData[$formationKey] = [];

            // Dynamically fetch and map data based on variable templates
            foreach ($template->variableTemplates as $variable) {
                $modelClass = 'App\\Models\\' . ucfirst($variable->source_model);
                $modelClass = substr($modelClass, 0, -1);  // Assuming you need to remove the last character

                // Check if the value contains '_' and remove it
                if (strpos($modelClass, '_') !== false) {
                    $modelClass = str_replace('_', '', $modelClass);
                }

                if (!class_exists($modelClass)) {
                    throw new \Exception("Model {$modelClass} does not exist.");
                }

                $modelInstance = new $modelClass();
                $records = $modelInstance->all();

                foreach ($records as $record) {
                    $formationData[$formationKey][$variable->variable_name] = $record->{$variable->source_field};
                    $templateProcessor->setValue($formationKey . '_' . $variable->variable_name, $record->{$variable->source_field});
                }
            }

            // Add sessions for this formation
            foreach ($formation->sessions as $sessionIndex => $session) {
                $sessionKey = 'session ' . ($sessionIndex + 1);
                $formationData[$formationKey][$sessionKey] = [
                    'sessionTitle' => $session->title,
                    'dateDébutSession' => $session->startDate,
                    'dateFinSession' => $session->endDate,
                ];

                // Set session values in the template
                foreach ($formationData[$formationKey][$sessionKey] as $sessionField => $sessionValue) {
                    $templateProcessor->setValue($formationKey . '_' . $sessionKey . '_' . $sessionField, $sessionValue);
                }
            }
        }

        $templateProcessor->saveAs($tempTemplatePath);  // Save the modified document

        // Convert DOCX to PDF
        \PhpOffice\PhpWord\Settings::setPdfRendererPath(base_path('vendor/dompdf/dompdf'));
        \PhpOffice\PhpWord\Settings::setPdfRendererName('DomPDF');
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($tempTemplatePath);
        $pdfWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'PDF');
        $pdfPath = public_path('DocumentsGenerated/' . str_replace(".docx", ".pdf", $template->docName));
        $pdfWriter->save($pdfPath);

        unlink($tempTemplatePath);

        // Log the document generation
        DocumentLog::create([
            'participant_id' => null,
            'session_id' => null, // Assuming no specific session
            'formation_id' => null,
            'document_type' => "CatalogueDesFormations{$type}",
            'document_generated' => $template->docName,
            'generated_at' => Carbon::now()
        ]);

        // Return downloadable file response
        return response()->download($originalTemplatePath, $template->docName, [
            'Content-Type' => 'application/pdf'
        ]);
    }

    private function fillTemplateWithData($pathToFile, $template, $type)
    {
        $tempTemplatePath = public_path('temp/' . $template->docName);

        if (!copy($pathToFile, $tempTemplatePath)) {
            return response()->json(['error' => 'Erreur lors de la copie du modèle du document !'], 500);
        }

        if ($type == 'ParMois') {
            $date = Carbon::now();

            // check if there are sessions in this month
            $sessions = Session::whereMonth('startDate', $date->month)
                ->whereYear('startDate', $date->year)
                ->get();

            if ($sessions->count() > 0) {
                foreach ($sessions as $session) {

                    $formation = Formation::findOrFail($session->formation_id);

                    $templateProcessor = new TemplateProcessor($tempTemplatePath);
                    $templateProcessor->setValue('month', $date->month);
                    $templateProcessor->setValue('title', $session->title);
                    $templateProcessor->setValue('reference', $session->reference);
                    $templateProcessor->setValue('subCategory', SousCategorie::findOrFail($formation->sous_categorie_id)->sous_categorie_name);
                    $templateProcessor->setValue('days', $formation->numberOfDays);
                    $templateProcessor->setValue('startDate', $session->startDate);
                    $templateProcessor->setValue('endDate', $session->endDate);
                    $templateProcessor->saveAs($tempTemplatePath);  // Save the modified document

                    // Convert DOCX to PDF
                    \PhpOffice\PhpWord\Settings::setPdfRendererPath(base_path('vendor/dompdf/dompdf'));
                    \PhpOffice\PhpWord\Settings::setPdfRendererName('DomPDF');
                    $phpWord = \PhpOffice\PhpWord\IOFactory::load($tempTemplatePath);
                    $pdfWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'PDF');
                    $pdfPath = public_path('DocumentsGenerated/' . $session->title . str_replace(".docx", ".pdf", $template->docName));
                    $pdfWriter->save($pdfPath);

                    unlink($tempTemplatePath);

                    DocumentLog::create([
                        'participant_id' => null,
                        'session_id' => $session->id,
                        'document_type' => 'CatalogueDesFormationsParMois',
                        'document_generated' => $session->title . str_replace(".docx", ".pdf", $template->docName),
                    ]);

                    return response()->json(['message' => 'Document généré avec succès !']);
                }
            } else {
                return response()->json(['error' => 'Aucune session trouvée pour ce mois !'], 404);
            }
        }

    }

}
