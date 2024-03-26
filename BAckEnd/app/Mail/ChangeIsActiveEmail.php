<?php

namespace App\Mail;

use Faker\Provider\ar_EG\Address;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ChangeIsActiveEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $causes;
    public $user;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($causes, $user)
    {
        $this->causes = $causes;
        $this->user = $user;
    }

    public function build()
    {
        return $this->view('emails.changeIsActive')
            ->with(['causes'=> $this->causes,'user'=> $this->user])
            ->subject(`$this->user->isActive ? "Activation" : "Désactivation" de votre compte`);
    }
}
