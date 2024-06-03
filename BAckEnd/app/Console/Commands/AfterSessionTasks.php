<?php

namespace App\Console\Commands;

use App\Jobs\GenerateDocuments;
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
        // return Command::SUCCESS;
        $sessions = Session::where('endDate', '<', now())->get();
        foreach ($sessions as $session) {
            $delay = $session->endDate->addDay(); // Delay the job by one day after session's endDate
            GenerateDocuments::dispatch($session)->delay($delay);
            // SendThankYouEmails::dispatch($session)->delay($delay);
        }
    }
}
