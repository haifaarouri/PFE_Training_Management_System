<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class MyEmail extends Mailable
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
        $frontendUrl = config('app.frontend_url');

        $verifyUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $this->user->id, 'hash' => sha1($this->user->email)]
        );

        $path = parse_url($verifyUrl, PHP_URL_PATH);
        $queryParams = parse_url($verifyUrl, PHP_URL_QUERY);

        $verificationUrl = "{$frontendUrl}{$path}?{$queryParams}";

        return $this->view('emails.newUserWelcome')
            ->with([
                'verificationUrl' => $verificationUrl,
                'firstName' => $this->user->firstName,
                'email' => $this->user->email,
                'lastName' => $this->user->lastName,
                'role' => $this->user->role,
                'phoneNumber' => $this->user->phoneNumber,
                'profileImage' => $this->user->profileImage
            ])
            ->subject('Nouveau compte administateur créé avec succès !');
    }
}
