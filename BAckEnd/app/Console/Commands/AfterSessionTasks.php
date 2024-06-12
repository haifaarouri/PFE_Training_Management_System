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
            $endDate = $session->endDate;
            $tomorrow = now()->addDay();
            $dayAfterTomorrow = now()->addDays(2);

            if ($endDate->isTomorrow()) {
                $participants = $session->participants;

                foreach ($participants as $participant) {
                    GenerateDocuments::dispatch($session, $participant)->delay($tomorrow);
                    SendEmailsThankAndEvaluation::dispatch($session, $participant)->delay($tomorrow);
                }
            } elseif (now()->greaterThanOrEqualTo($dayAfterTomorrow)) {
                // Do not generate documents or send emails
                continue;
            }
        }

        return 0;
    }
}
