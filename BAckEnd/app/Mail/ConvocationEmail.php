<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConvocationEmail extends Mailable
{
    use Queueable, SerializesModels;

    // public $session;
    // public $participant;

    // /**
    //  * Create a new message instance.
    //  *
    //  * @return void
    //  */
    // public function __construct($session, $participant)
    // {
    //     $this->session = $session;
    //     $this->participant = $participant;
    // }

    // /**
    //  * Get the message envelope.
    //  *
    //  * @return \Illuminate\Mail\Mailables\Envelope
    //  */
    // public function envelope()
    // {
    //     return new Envelope(
    //         subject: 'Convocation Email',
    //     );
    // }

    // /**
    //  * Get the message content definition.
    //  *
    //  * @return \Illuminate\Mail\Mailables\Content
    //  */
    // public function content()
    // {
    //     return new Content(
    //         view: 'view.name',
    //     );
    // }

    // /**
    //  * Get the attachments for the message.
    //  *
    //  * @return array
    //  */
    // public function attachments()
    // {
    //     return [];
    // }

    // public function build()
    // {
    //     return $this->view('emails.convocation')
    //         ->with(['session' => $this->session, 'participant' => $this->participant])
    //         ->subject("Convocation de la session de formation : " . $this->session->title);
    // }

    public $subject;
    public $content;

    public $imageAttachment;

    public function __construct($subject, $content, $imageAttachment)
    {
        $this->subject = $subject;
        $this->content = $content;
        $this->imageAttachment = $imageAttachment ?? [];
    }

    public function build()
    {
        $email = $this->subject($this->subject)
            ->html($this->content);

        foreach ($this->imageAttachment as $image) {
            $filePath = public_path('emailAttachements/' . $image);
            if (file_exists($filePath)) {
                $email->attach($filePath);
            } else {
                \Log::warning("File not found for attachment: " . $filePath);
            }
        }

        return $email;
    }
}
