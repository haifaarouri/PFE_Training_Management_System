<?php

namespace App\Console\Commands;

use App\Jobs\GenerateDocuments;
use App\Jobs\SendEmailsThankAndEvaluation;
use App\Models\Session;
use Illuminate\Console\Command;

class AfterSessionTasks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'AfterSessionTasks';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $sessions = Session::where('endDate', '<', now())->get();

        foreach ($sessions as $session) {
            $participants = $session->participants;

            foreach ($participants as $participant) {
                $delay = $session->endDate->addDay();
                GenerateDocuments::dispatch($session, $participant)->delay($delay);
                SendEmailsThankAndEvaluation::dispatch($session, $participant)->delay($delay);
            }
        }
    }
}
