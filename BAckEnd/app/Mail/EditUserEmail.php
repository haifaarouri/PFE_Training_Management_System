<?php

namespace App\Mail;

use Faker\Provider\ar_EG\Address;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EditUserEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($user)
    {
        $this->user = $user;
    }

    public function build()
    {
        return $this->view('emails.editUserMail')
            ->with([
                'firstName' => $this->user->firstName,
                'email' => $this->user->email,
                'lastName' => $this->user->lastName,
                'role' => $this->user->role,
                'phoneNumber' => $this->user->phoneNumber,
                'profileImage' => $this->user->profileImage
            ])
            ->subject('Mettre à jour le profil administateur avec succès !');
    }
}
