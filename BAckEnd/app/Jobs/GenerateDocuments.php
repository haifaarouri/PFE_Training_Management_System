<?php

namespace App\Jobs;

use App\Models\DocumentLog;
use App\Models\DocumentTemplate;
use Dompdf\Dompdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use PhpOffice\PhpWord\TemplateProcessor;

class GenerateDocuments implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $session;
    protected $participant;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($session, $participant)
    {
        $this->session = $session;
        $this->participant = $participant;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $template = DocumentTemplate::where('type', 'AttestationDePrésence')->first();
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
        $templateProcessor->setValue('firstName', $this->participant->firstName);
        $templateProcessor->setValue('lastName', $this->participant->lastName);
        $templateProcessor->setValue('sessionTitle', $this->session->title);
        $templateProcessor->setValue('formationRef', $this->session->reference);
        $templateProcessor->saveAs($tempTemplatePath);  // Save the modified document

        // Convert DOCX to PDF
        \PhpOffice\PhpWord\Settings::setPdfRendererPath(base_path('vendor/dompdf/dompdf'));
        \PhpOffice\PhpWord\Settings::setPdfRendererName('DomPDF');
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($tempTemplatePath);
        $pdfWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'PDF');
        $pdfPath = public_path('DocumentsGenerated/' . $this->participant->id . $this->session->title . str_replace(".docx", ".pdf", $template->docName));
        $pdfWriter->save($pdfPath);

        unlink($tempTemplatePath);

        DocumentLog::create([
            'participant_id' => $this->participant->id,
            'session_id' => $this->session->id,
            'document_type' => 'AttestationDePrésence',
            'document_generated' => $this->participant->id . $this->session->title . str_replace(".docx", ".pdf", $template->docName),
        ]);
    }
}
