<?php

namespace App\Jobs;

use App\Models\DocumentLog;
use App\Models\DocumentTemplate;
use App\Models\Formation;
use App\Models\Participant;
use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use PhpOffice\PhpWord\TemplateProcessor;

class GenerateDocuments implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $context;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($context)
    {
        $this->context = $context;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $session = Session::find($this->context['session_id']);
        if (!$session) {
            \Log::error("session not found with ID: " . $this->context['session_id']);
            return;
        }

        $participant = Participant::find($this->context['participant_id']);
        if (!$participant) {
            \Log::error("Participant not found with ID: " . $this->context['participant_id']);
            return;
        }

        $formation = Formation::find($this->context['formation_id']);
        if (!$formation) {
            \Log::error("formation not found with ID: " . $this->context['formation_id']);
            return;
        }

        //Attestation de Présence
        $template = DocumentTemplate::where('type', 'AttestationDePrésence')->with('variableTemplates')->first();
        if (!$template) {
            return response()->json(['error' => 'Modèle du document de type Attestation De Présence non trouvé !'], 404);
        }

        $originalTemplatePath = public_path('documentTemplates/' . $template->docName);
        $tempTemplatePath = public_path('temp/' . time() . '_' . $template->docName);
        if (!copy($originalTemplatePath, $tempTemplatePath)) {
            \Log::error('Failed to copy template file.');
            throw new \Exception("Failed to copy template file for processing.");
        }

        $templateProcessor = new TemplateProcessor($tempTemplatePath);
        $templateProcessor->setValue('nomParticipant', $participant->firstName);
        $templateProcessor->setValue('prénomParticipant', $participant->lastName);
        $templateProcessor->setValue('entreprise', $participant->companyName);
        $templateProcessor->setValue('sessionTitle', $session->title);
        $templateProcessor->setValue('formationRef', $session->reference);
        $templateProcessor->setValue('dateDébutSession', $session->startDate);
        $templateProcessor->setValue('dateFinSession', $session->endDate);
        $templateProcessor->saveAs($tempTemplatePath);  // Save the modified document

        // Convert DOCX to PDF
        \PhpOffice\PhpWord\Settings::setPdfRendererPath(base_path('vendor/dompdf/dompdf'));
        \PhpOffice\PhpWord\Settings::setPdfRendererName('DomPDF');
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($tempTemplatePath);
        $pdfWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'PDF');
        $pdfPath = public_path('DocumentsGenerated/' . $participant->id . $session->title . str_replace(".docx", ".pdf", $template->docName));
        $pdfWriter->save($pdfPath);

        unlink($tempTemplatePath);

        DocumentLog::create([
            'participant_id' => $participant->id,
            'session_id' => $session->id,
            'formation_id' => $session->formation_id,
            'document_type' => 'AttestationDePrésence',
            'document_generated' => $participant->id . $session->title . str_replace(".docx", ".pdf", $template->docName),
            'generated_at' => Carbon::now()
        ]);

        //Feuille de Présence
        $templateFeuillePresence = DocumentTemplate::where('type', 'FeuilleDePrésence')->with('variableTemplates')->first();
        if (!$templateFeuillePresence) {
            return response()->json(['error' => 'Modèle du document de type Feuille De Présence non trouvé !'], 404);
        }

        $originalTemplatePathFeuillePresence = public_path('documentTemplates/' . $templateFeuillePresence->docName);
        $tempTemplatePathFeuillePresence = public_path('temp/' . time() . '_' . $templateFeuillePresence->docName);

        // Check if the original template file exists and is readable
        if (!file_exists($originalTemplatePathFeuillePresence) || !is_readable($originalTemplatePathFeuillePresence)) {
            \Log::error("Template file does not exist or is not readable: {$originalTemplatePathFeuillePresence}");
            throw new \Exception("Template file does not exist or is not readable: {$originalTemplatePathFeuillePresence}");
        }

        // Ensure the destination directory exists and is writable
        $tempDir = public_path('temp/');
        if (!file_exists($tempDir) || !is_writable($tempDir)) {
            \Log::error("Temporary directory does not exist or is not writable: {$tempDir}");
            throw new \Exception("Temporary directory does not exist or is not writable: {$tempDir}");
        }

        if (!copy($originalTemplatePathFeuillePresence, $tempTemplatePathFeuillePresence)) {
            \Log::error('Failed to copy template file.');
            throw new \Exception("Failed to copy template file for processing.");
        }

        $templateProcessor = new TemplateProcessor($tempTemplatePathFeuillePresence);

        foreach ($templateFeuillePresence->variableTemplates as $variable) {
            $modelClass = 'App\\Models\\' . ucfirst(substr($variable->source_model, 0, -1));
            if (!class_exists($modelClass)) {
                throw new \Exception("Model {$modelClass} does not exist.");
            }

            $modelInstance = new $modelClass();

            $recordId = $this->context[strtolower(substr($variable->source_model, 0, -1)) . '_id'] ?? null;
            if (!$recordId) {
                throw new \Exception("No ID provided for model {$modelClass}.");
            }

            $record = $modelInstance->find($recordId);
            if (!$record) {
                throw new \Exception("No record found for ID {$recordId} in model {$modelClass}.");
            }

            $value = $record->{$variable->source_field};

            $templateProcessor->setValue($variable->variable_name, $value);
        }

        $templateProcessor->saveAs($tempTemplatePathFeuillePresence);  // Save the modified document

        // Convert DOCX to PDF
        \PhpOffice\PhpWord\Settings::setPdfRendererPath(base_path('vendor/dompdf/dompdf'));
        \PhpOffice\PhpWord\Settings::setPdfRendererName('DomPDF');
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($tempTemplatePathFeuillePresence);
        $pdfWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'PDF');
        $pdfPath = public_path('DocumentsGenerated/' . $formation->id . $session->title . str_replace(".docx", ".pdf", $templateFeuillePresence->docName));
        $pdfWriter->save($pdfPath);

        unlink($tempTemplatePathFeuillePresence);

        DocumentLog::create([
            'formation_id' => $formation->id,
            'participant_id' => null,
            'session_id' => $session->id,
            'document_type' => 'FeuilleDePrésence',
            'document_generated' => $formation->id . $session->title . str_replace(".docx", ".pdf", $templateFeuillePresence->docName),
        ]);
    }
}
