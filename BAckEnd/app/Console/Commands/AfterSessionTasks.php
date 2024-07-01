<?php

namespace App\Console\Commands;

use App\Jobs\GenerateDocuments;
use App\Jobs\SendEmailsThankAndEvaluation;
use App\Models\DocumentTemplate;
use App\Models\EmailTemplate;
use App\Models\JourSession;
use App\Models\Session;
use Carbon\Carbon;
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

    public function buildContextForTemplate($templateId, $additionalParams, $type)
    {
        $template = $type == "Email" ? EmailTemplate::with('variableTemplates')->find($templateId) : DocumentTemplate::with('variableTemplates')->find($templateId);
        $variables = $template->variableTemplates;
        $context = [];

        foreach ($variables as $variable) {
            $modelClass = '\\App\\Models\\' . $variable->source_model;
            if (!class_exists($modelClass)) {
                throw new \Exception("Model {$modelClass} does not exist.");
            }

            $modelInstance = new $modelClass();
            $recordIdKey = strtolower($variable->source_model) . '_id';
            $record = $modelInstance->find($additionalParams[$recordIdKey]);

            if (!$record) {
                throw new \Exception("Record not found for model {$modelClass} with ID {$additionalParams[$recordIdKey]}.");
            }

            $context[$variable->variable_name] = $record->{$variable->source_field};
        }

        return $context;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $sessions = Session::where('endDate', '<', now())->get();

        foreach ($sessions as $session) {
            $tomorrow = now()->addDay();
            $dayAfterTomorrow = now()->addDays(2);
            $endDate = Carbon::parse($session->endDate);

            if ($endDate->isTomorrow()) {
                $participants = $session->participants;

                if ($session->jour_sessions->count() > 0 && $session->participants()->count() > 0) {
                    foreach ($participants as $participant) {
                        $jourSessions = JourSession::where('session_id', $session->id)->whereNotNull('session_id')
                            ->whereNotNull('formateur_id')
                            ->whereNotNull('salle_id')
                            ->where('confirmation_status', 'accepted')
                            ->get();
                        if ($jourSessions->count() > 0) {
                            foreach ($jourSessions as $jour) {
                                $context = [
                                    'session_id' => $session->id,
                                    'participant_id' => $participant->id,
                                    'formation_id' => $session->formation_id,
                                    'formateur_id' => $jour->formateur_id,
                                    'sous_categorie_id' => $session->formation->sousCategorie->id,
                                    'categorie_id' => $session->formation->sousCategorie->categorie->id,
                                    'joursSession' => $session->jour_sessions,
                                    'programme_formation_id' => $session->formation->programme->id,
                                    'jours_formation_id' => $session->formation->programme->jourFormations->id,
                                    'sous_parties_id' => $session->formation->programme->jourFormations->sousParties->id
                                ];

                                GenerateDocuments::dispatch($context)->delay($tomorrow);
                                SendEmailsThankAndEvaluation::dispatch($session, $participant)->delay($tomorrow);
                            }
                        }
                    }
                }
            } elseif (now()->greaterThanOrEqualTo($dayAfterTomorrow)) {
                // Do not generate documents or send emails
                continue;
            }
        }

        return 0;
    }
}
