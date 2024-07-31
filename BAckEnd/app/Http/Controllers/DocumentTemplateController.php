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

    private function setTemplateValues($templateProcessor, $model, $variableTemplates, $formationIndex, $sessionIndex = null)
    {
        foreach ($variableTemplates as $variable) {
            if ($variable->source_model[-1] === 's') {
                $variable->source_model = substr($variable->source_model, 0, -1);
            }

            if (strpos($variable->source_model, '_') !== false) {
                $variable->source_model = str_replace('_', '', $variable->source_model);
            }

            $modelClass = 'App\\Models\\' . ucfirst($variable->source_model); //upper case first caracter of a string

            if (!class_exists($modelClass)) {
                throw new \Exception("Model {$modelClass} does not exist.");
            }

            $modelInstance = new $modelClass();
            $keyFieldValue = $model->{$variable->key_field};
            $record = $modelInstance->where($variable->key_field, $keyFieldValue)->first();

            if ($record) {
                $value = $record->{$variable->source_field};
                $placeholder = "{$variable->variable_name}#{$formationIndex}";
                if ($sessionIndex) {
                    $placeholder .= "#{$sessionIndex}";
                }
                $templateProcessor->setValue($placeholder, $value);
            }
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

        // Determine the date range based on the catalog type
        $date = Carbon::now();

        switch ($type) {
            case 'CatalogueDesFormationParMois':
                $startDate = $date->copy()->startOfMonth();
                $endDate = $date->copy()->endOfMonth()->endOfDay();
                break;
            case 'CatalogueDesFormationParTrimestre':
                $startDate = $date->copy()->firstOfQuarter();
                $endDate = $date->copy()->lastOfQuarter()->endOfDay();
                break;
            case 'CatalogueDesFormationParSemestre':
                if ($date->month <= 6) {
                    $startDate = $date->copy()->startOfYear();
                    $endDate = $date->copy()->startOfYear()->addMonths(6)->subDay()->endOfDay();
                } else {
                    $startDate = $date->copy()->startOfYear()->addMonths(6);
                    $endDate = $date->copy()->endOfYear()->endOfDay();
                }
                break;
            case 'CatalogueDesFormationParAn':
                $startDate = $date->copy()->startOfYear();
                $endDate = $date->copy()->endOfYear()->endOfDay();
                break;
            default:
                return response()->json(['error' => 'Type de catalogue non supporté !'], 400);
        }

        // Fetch formations within the determined date range
        $formations = Formation::with([
            'sessions' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('startDate', [$startDate, $endDate]);
            }
        ])
            // ->whereHas('sessions', function ($query) use ($startDate, $endDate) {
            //     $query->whereBetween('startDate', [$startDate, $endDate]);
            // })
            ->get();

        $templateProcessor->cloneRow('formationRow', count($formations));

        $formationIndex = 1;
        foreach ($formations as $formation) {
            $this->setTemplateValues($templateProcessor, $formation, $template->variableTemplates, $formationIndex);

            $sessions = $formation->sessions;
            $templateProcessor->cloneRow("sessionRow#{$formationIndex}", count($sessions));
            $sessionIndex = 1;

            foreach ($sessions as $session) {
                $this->setTemplateValues($templateProcessor, $session, $template->variableTemplates, $formationIndex, $sessionIndex);
                $sessionIndex++;
            }

            $formationIndex++;
        }

        $templateProcessor->saveAs($tempTemplatePath);  // Save the modified document

        // Convert DOCX to PDF
        \PhpOffice\PhpWord\Settings::setPdfRendererPath(base_path('vendor/dompdf/dompdf'));
        \PhpOffice\PhpWord\Settings::setPdfRendererName('DomPDF');
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($tempTemplatePath);
        $pdfWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'PDF');
        $pdfPath = public_path('DocumentsGenerated/' . time() . '_' . $type . str_replace(".docx", ".pdf", $template->docName));
        $pdfWriter->save($pdfPath);

        unlink($tempTemplatePath);

        // Log the document generation
        DocumentLog::create([
            'participant_id' => null,
            'session_id' => null,
            'formation_id' => null,
            'document_type' => $type,
            'document_generated' => time() . '_' . $type,
            'generated_at' => Carbon::now()
        ]);

        return response()->json(['url' => url('/DocumentsGenerated/' . basename($pdfPath))]);
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
