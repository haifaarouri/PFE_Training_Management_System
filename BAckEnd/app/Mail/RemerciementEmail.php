<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RemerciementEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $content;
    public $imageAttachment;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($subject, $content, $imageAttachment)
    {
        $this->subject = $subject;
        $this->content = $content;
        $this->imageAttachment = $imageAttachment ?? [];
    }

    /**
     * Get the message envelope.
     *
     * @return \Illuminate\Mail\Mailables\Envelope
     */
    // public function envelope()
    // {
    //     return new Envelope(
    //         subject: 'Remerciement Email',
    //     );
    // }

    /**
     * Get the message content definition.
     *
     * @return \Illuminate\Mail\Mailables\Content
     */
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
