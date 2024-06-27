<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TrainerConfirmationEmail extends Mailable
{
    use Queueable, SerializesModels;

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
