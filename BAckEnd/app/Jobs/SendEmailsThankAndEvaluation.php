<?php

namespace App\Jobs;

use App\Mail\RemerciementEmail;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
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

        $data = [
            'sessionTitle' => $this->session->title,
            'firstName' => $this->participant->firstName,
            'lastName' => $this->participant->lastName,
            'formationRef' => $this->session->reference,
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
    }
}
