<?php

namespace App\Jobs;

use App\Mail\EvaluationLinkEmail;
use App\Mail\RemerciementEmail;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Models\Formulaire;
use GuzzleHttp\Client;
use Illuminate\Bus\Queueable;
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
    protected $prefilledUrl;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($session, $participant, $prefilledUrl)
    {
        $this->session = $session;
        $this->participant = $participant;
        $this->prefilledUrl = $prefilledUrl;
    }

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

        $lastCourse = $this->participant->formations->last();
        $recommendations = [];
        $client = new Client();

        try {
            $response = $client->request('POST', 'http://localhost:5000/recommend', [
                'json' => [
                    'course_name' => $lastCourse->entitled,
                    'n_recommendations' => 10
                ]
            ]);

            if ($response->getStatusCode() == 200) {
                $recommendations = json_decode($response->getBody(), true);
            }
        } catch (\Exception $e) {
            \Log::error("Failed to fetch recommendations: " . $e->getMessage());
        }

        if (!$recommendations) {
            \Log::error("No recommendations fetched for the participant with ID: " . $this->participant->id);
            return;
        }

        $courseList = implode("<br>", array_column($recommendations, 'course'));

        //Remerciement Email
        $data = [
            'sessionTitle' => $this->session->title,
            'nomParticipant' => $this->participant->firstName,
            'prénomParticipant' => $this->participant->lastName,
            'formationRef' => $this->session->reference,
            'link' => $this->prefilledUrl,
            'recommendations' => $courseList
        ];

        $subject = $this->replacePlaceholders($template->subject, $data);
        $content = $this->replacePlaceholders($template->htmlContent, $data);

        $imageAttachments = json_decode($template->imageAttachement, true) ?? [];

        Mail::to($this->participant->email)->send(new RemerciementEmail($subject, $content, $imageAttachments));

        EmailLog::create([
            'participant_id' => $this->participant->id,
            'session_id' => $this->session->id,
            'email_type' => 'Thanking',
        ]);

        //Evaluation Email
        $subjectLink = $this->replacePlaceholders($templateEmailLink->subject, $data);
        $contentLink = $this->replacePlaceholders($templateEmailLink->htmlContent, $data);

        $imageAttachmentsLink = json_decode($templateEmailLink->imageAttachement, true) ?? [];

        Mail::to($this->participant->email)->send(new EvaluationLinkEmail($subjectLink, $contentLink, $imageAttachmentsLink));

        EmailLog::create([
            'participant_id' => $this->participant->id,
            'session_id' => $this->session->id,
            'email_type' => 'EvaluationLink',
        ]);
    }
}
