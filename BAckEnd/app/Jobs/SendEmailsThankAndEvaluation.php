<?php

namespace App\Jobs;

use App\Mail\EvaluationLinkEmail;
use App\Mail\RemerciementEmail;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Models\Formulaire;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendEmailsThankAndEvaluation implements ShouldQueue
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

    // public function replaceVariables($templateContent, $context) {
    //     $variables = TemplateVariable::where('document_type_id', $context['document_type_id'])->get();
    
    //     foreach ($variables as $variable) {
    //         $modelClass = 'App\\Models\\' . $variable->source_model;
    //         $modelInstance = new $modelClass();
    
    //         // Assuming you have a way to determine the specific record, e.g., through a context ID
    //         $record = $modelInstance->find($context[$variable->source_model . '_id']);
    
    //         $value = $record->{$variable->source_field};
    //         $templateContent = str_replace("{" . $variable->variable_name . "}", $value, $templateContent);
    //     }
    
    //     return $templateContent;
    // }

    private function replacePlaceholders($text, $data)
    {
        foreach ($data as $key => $value) {
            $text = str_replace("{" . $key . "}", $value, $text);
        }
        return $text;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $template = EmailTemplate::where('type', 'Thanking')->first();
        if (!$template) {
            return response()->json(['error' => 'Modèle d\'e-mail de remerciement non trouvé !'], 404);
        }

        $templateEmailLink = EmailTemplate::where('type', 'EvaluationLink')->first();
        if (!$templateEmailLink) {
            return response()->json(['error' => 'Modèle d\'e-mail de lien d\'évaluaton non trouvé !'], 404);
        }

        $survey = Formulaire::firstOrFail();

        //Remerciement Email
        $data = [
            'sessionTitle' => $this->session->title,
            'firstName' => $this->participant->firstName,
            'lastName' => $this->participant->lastName,
            'formationRef' => $this->session->reference,
            'link' => $survey->surveyLink
        ];

        $subject = $this->replacePlaceholders($template->subject, $data);
        $content = $this->replacePlaceholders($template->content, $data);

        $imageAttachments = json_decode($template->imageAttachement, true) ?? [];

        Mail::to($this->participant->email)->send(new RemerciementEmail($subject, $content, $imageAttachments));

        EmailLog::create([
            'participant_id' => $this->participant->id,
            'session_id' => $this->session->id,
            'email_type' => 'Thanking',
        ]);

        //Evaluation Email
        $subjectLink = $this->replacePlaceholders($templateEmailLink->subject, $data);
        $contentLink = $this->replacePlaceholders($templateEmailLink->content, $data);

        $imageAttachmentsLink = json_decode($templateEmailLink->imageAttachement, true) ?? [];

        Mail::to($this->participant->email)->send(new EvaluationLinkEmail($subjectLink, $contentLink, $imageAttachmentsLink));

        EmailLog::create([
            'participant_id' => $this->participant->id,
            'session_id' => $this->session->id,
            'email_type' => 'EvaluationLink',
        ]);
    }
}
