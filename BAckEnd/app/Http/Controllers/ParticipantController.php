<?php

namespace App\Http\Controllers;

use App\Mail\ConvocationEmail;
use App\Models\Candidat;
use App\Models\EmailTemplate;
use App\Models\JourFormation;
use App\Models\JourSession;
use App\Models\ProgrammeFormation;
use App\Models\Session;
use App\Models\SousPartie;
use App\Rules\CandidatTypeRule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\participant;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Spatie\CalendarLinks\Link;

// séparation des préoccupations : but de création des classe Participant et Candidat
class ParticipantController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $participants = Participant::with('sessions')->get();
            return response()->json($participants);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function store(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {

                $validator = Validator::make($request->all(), [
                    'firstName' => 'required|string|max:255',
                    'lastName' => 'required|string|max:255',
                    'email' => 'required|string|email|unique:participants|max:255',
                    'phoneNumber' => 'required|string|max:255|min:8',
                    'address' => 'required|string|max:255',
                    'type' => ['required', new CandidatTypeRule()],
                    'companyName' => 'string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $participant = Participant::create([
                    'firstName' => $request->input('firstName'),
                    'lastName' => $request->input('lastName'),
                    'email' => $request->input('email'),
                    'phoneNumber' => $request->input('phoneNumber'),
                    'address' => $request->input('address'),
                    'type' => $request->input('type'),
                    'companyName' => $request->input('companyName'),
                ]);

                return response()->json($participant, 201);
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de l\'ajout du participant !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $participant = Participant::find($id);
            if (!$participant) {
                return response()->json(['error' => 'participant avec cette ID non trouvé !'], 404);
            }
            return response()->json($participant);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {

        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $participant = Participant::find($id);
                if (!$participant) {
                    return response()->json(['error' => 'participant avec cette ID non trouvé !'], 404);
                }

                $validator = Validator::make($request->all(), [
                    'firstName' => 'required|string|max:255',
                    'lastName' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255',
                    'phoneNumber' => 'required|string|max:255|min:8',
                    'address' => 'required|string|max:255',
                    'type' => ['required', new CandidatTypeRule()],
                    'companyName' => 'string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $participant->firstName = $request->input('firstName');
                $participant->lastName = $request->input('lastName');
                $participant->email = $request->input('email');
                $participant->type = $request->input('type');
                $participant->phoneNumber = $request->input('phoneNumber');
                $participant->address = $request->input('address');
                $participant->companyName = $request->input('companyName');
                $participant->save();

                return response()->json($participant, 200);
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de la mise à jour du participant !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $participant = Participant::find($id);
            if (!$participant) {
                return response()->json(['error' => 'participant avec cette ID non trouvé !'], 404);
            }

            $participant->delete();
            return response()->json(['message' => 'participant supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function convertToParticipant($candidatId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $candidat = Candidat::find($candidatId);

        if (!$candidat) {
            return response()->json(['error' => 'Candidat non trouvé !'], 404);
        }

        // Check if any formation is confirmed
        $confirmed = $candidat->formations->contains(function ($value, $key) {
            return $value->pivot->registerStatus == 'Confirmé';
        });

        if (!$confirmed) {
            return response()->json(['error' => 'Aucune formation confirmée pour ce candidat !'], 400);
        }

        try {
            Participant::create([
                'firstName' => $candidat->firstName,
                'lastName' => $candidat->lastName,
                'email' => $candidat->email,
                'phoneNumber' => $candidat->phoneNumber,
                'address' => $candidat->address,
                'type' => $candidat->type,
                'companyName' => $candidat->companyName,
            ]);

            // $candidat->delete();
            return response()->json(['message' => 'Candidat est convertit à participant avec succès !']);
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) {
                return response()->json(['error' => 'Ce candidat est déjà converti à un participant !'], 400);
            }
            return response()->json(['error' => 'Erreur lors de la convertion du candidat à un participant !'], 500);
        }
    }

    public function sendConvocationEmail($firstName, $lastName, $session, $templateId, $participantEmail)
    {
        try {
            $template = EmailTemplate::find($templateId);
            if (!$template) {
                return response()->json(['error' => 'Modèle d\'e-mail non trouvé !'], 404);
            }

            $from = Carbon::parse($session->startDate, 'Africa/Tunis');
            $to = Carbon::parse($session->endDate, 'Africa/Tunis');

            $link = Link::create($session->title, $from, $to)
                ->description($session->reference)
                ->address($session->location);

            // Generate links for different calendars
            $googleLink = $link->google();
            $outlookLink = $link->webOutlook();

            $programme = ProgrammeFormation::where("formation_id", $session->formation_id)->get();

            $jours = JourFormation::where("programme_formation_id", $programme[0]->id)->get();

            $data = [];
            $joursData = [];

            foreach ($jours as $j) {
                $sousParties = SousPartie::where("jour_formation_id", $j->id)->get();

                foreach ($sousParties as $sp) {
                    $sousPartiesData[] = ['description' => $sp['description']];
                }

                $joursData[] = [
                    'jourName' => $j['dayName'],
                    'sousPartie' => $sousPartiesData
                ];
            }

            $data = [
                'prénomParticipant' => $firstName,
                'nomParticipant' => $lastName,
                'sessionTitle' => $session->title,
                'formationRef' => $session->reference,
                'dateDébutSession' => $session->startDate,
                'dateFinSession' => $session->endDate,
                'googleLink' => $googleLink,
                'outlookLink' => $outlookLink,
                'programme' => $programme[0]->title,
                'jour' => $joursData,
                'sessionMode' => $session->sessionMode,
                'sessionLocation' => $session->location
                // 'sousPartie' => $sousPartiesData
            ];
            \Log::info(json_encode($data));
            $subject = $this->replacePlaceholders($template->subject, $data);
            $content = $this->replacePlaceholders($template->htmlContent, $data);

            $imageAttachments = json_decode($template->imageAttachement, true) ?? [];

            Mail::to($participantEmail)->send(new ConvocationEmail($subject, $content, $imageAttachments));

            return response()->json(['message' => 'E-mail envoyé avec succès !']);
        } catch (\PDOException $e) {
            \Log::error('Error : ' . $e->getMessage());
            if ($e->getCode() == 23000) {
                return response()->json(['error' => 'Ce participant est déjà inscrit à cette session !'], 400);
            }
            return response()->json(['error' => 'Erreur lors de l\'inscription à la session !'], 500);
        }
    }

    function replacePlaceholders($template, $data)
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $tempContent = "";
                foreach ($value as $item) {
                    if (is_array($item)) {
                        $itemContent = "";
                        foreach ($item as $itemKey => $subItem) {
                            if ($itemKey == 'sousPartie') {
                                foreach ($subItem as $sp) {
                                    $itemContent .= $sp['description'] . ", "; // Customize formatting as needed
                                }
                            } else {
                                $itemContent .= $item[$itemKey] . " "; // Customize formatting as needed
                            }
                        }
                        $tempContent .= trim($itemContent) . "\n"; // Customize formatting as needed
                    } else {
                        $tempContent .= $value . " "; // Handle non-array data
                    }
                }
                $template = str_replace("{" . $key . "}", trim($tempContent), $template);
            } else {
                $template = str_replace("{" . $key . "}", $value, $template);
            }
        }
        return $template;
    }

    // private function replacePlaceholders($text, $data)
    // {
    //     foreach ($data as $key => $value) {
    //         $text = str_replace("{" . $key . "}", $value, $text);
    //     }
    //     return $text;
    // }

    // public function replaceVariables($templateContent, $context) {
    //     $variables = TemplateVariable::where('document_type_id', $context['document_type_id'])->get();

    //     foreach ($variables as $variable) {
    //         $modelClass = 'App\\Models\\' . $variable->source_model;
    //         $modelInstance = new $modelClass();

    //         // Assuming you have a way to determine the specific record, e.g., through a context ID
    //         $record = $modelInstance->find($context[$variable->source_model . '_id']);

    //         $value = $record->{$variable->source_field};
    //         $templateContent = str_replace("{" . $variable->variable_name . "}", $value, $templateContent);
    //     }

    //     return $templateContent;
    // }

    public function participateToSession($participantId, $sessionId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $participant = Participant::find($participantId);
        $session = Session::find($sessionId);

        if (!$participant) {
            return response()->json(['error' => 'Participant non trouvé !'], 404);
        }

        if (!$session) {
            return response()->json(['error' => 'Session non trouvée !'], 404);
        }

        $candidat = Candidat::where('email', $participant->email)->first();

        if (!$candidat) {
            return response()->json(['error' => 'Aucun candidat correspondant trouvé pour cet email !'], 404);
        }

        $currentDate = now();

        // Check if the current date is within the registration period
        if (!$currentDate->between($session->registration_start, $session->registration_end)) {
            return response()->json(['error' => 'La période d\'inscription pour cette session est fermée !'], 403);
        }

        // Vérifier si le nombre maximum de participants est atteint
        if ($session->participants()->count() >= $session->max_participants) {
            // Add to waiting list
            $participant->sessions()->attach($sessionId, [
                'participationStatus' => 'Waitlisted',
                'waitlist_order' => $session->participants()->wherePivot('participationStatus', 'Waitlisted')->count() + 1
            ]);
            return response()->json(['error' => 'Participant ajouté à la liste d\'attente car la session a atteint le nombre maximum de participants !'], 400);
        }

        // Check if the session's formation is one of the formations the candidat has confirmed his inscription
        $confirmedFormationIds = $candidat->formations->where('pivot.registerStatus', 'Confirmé')->pluck('id');
        if (!in_array($session->formation_id, $confirmedFormationIds->toArray())) {
            return response()->json(['error' => 'Cette session n\'est pas liée à une formation confirmée par le candidat !'], 403);
        }

        $template = EmailTemplate::where('type', 'Convocation')->first();
        if (!$template) {
            return response()->json(['error' => 'Aucun template de convocation trouvé !'], 404);
        }

        try {
            $attributes = [
                'participationStatus' => "Confirmed",
            ];
            $participant->sessions()->attach($sessionId, $attributes);

            //send convocation automatically
            $this->sendConvocationEmail($participant->firstName, $participant->lastName, $session, $template->id, $participant->email);

            return response()->json(['message' => 'Participant inscrit à la session avec succès !']);
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) {
                return response()->json(['error' => 'Ce participant est déjà assigné à cette session !'], 400);
            }
            return response()->json(['error' => 'Erreur lors de la participation du participant à la formation.'], 500);
        } catch (\Exception $e) {
            \Log::error('Error attaching participant to session : ' . $e->getMessage());
            if ($e->getCode() == 23000) {
                return response()->json(['error' => 'Ce participant est déjà en liste d\'attente pour cette session !'], 400);
            }
            return response()->json(['error' => 'Erreur lors de la participation du participant à la session.'], 500);
        }
    }

    public function updateSessionStatus($participantId, $sessionId, Request $request)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $participant = Participant::find($participantId);
        $status = $request->input('registerStatus');

        if ($participant) {
            $participant->sessions()->updateExistingPivot($sessionId, ['participationStatus' => $status]);
            return response()->json(['message' => 'Statut de participation est modifié avec succès !']);
        }

        return response()->json(['error' => 'Participant non trouvé !'], 404);
    }

    // public function updatePresenceStatus($participantId, $sessionId, $jourSessionId, Request $request)
    // {
    //     if (!$this->list_roles->contains(auth()->user()->role)) {
    //         return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
    //     }

    //     $presenceStatus = $request->input('presence_status');

    //     $participant = Participant::find($participantId);
    //     if (!$participant) {
    //         return response()->json(['error' => 'Participant not found'], 404);
    //     }

    //     $participant->jourSessions()->updateExistingPivot($jourSessionId, [
    //         'presence_status' => $presenceStatus,
    //         'session_id' => $sessionId
    //     ]);

    //     return response()->json(['message' => 'Presence status updated successfully']);
    // }

    public function cancelParticipation($participantId, $sessionId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $participant = Participant::find($participantId);
        if (!$participant) {
            return response()->json(['error' => 'Participant non trouvé avec set Id !'], 404);
        }

        // Remove the participant from the session
        $participant->sessions()->detach($sessionId);

        // Attempt to update the waiting list
        Participant::updateWaitingList($sessionId);

        return response()->json(['message' => 'Participation annulée et liste d\'attente est mise à jour !'], 200);
    }

    public function getParticipantsInWaitingList($sessionId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $session = Session::find($sessionId);

        if (!$session) {
            return response()->json(['error' => 'Session avec cet Id non trouvée !'], 404);
        }

        $participants = $session->participantsInWaitingList()->get();

        return response()->json($participants);
    }

    public function updatePresenceStatus(Request $request, $participantId, $jourSessionId, $sessionId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $presenceStatus = $request->input('presenceStatus');

        $jourSession = JourSession::find($jourSessionId);
        if (!$jourSession) {
            return response()->json(['error' => 'JourSession non trouvé !'], 404);
        }

        $participant = $jourSession->participants()->where('participant_id', $participantId)->first();
        if ($participant) {
            $jourSession->participants()->updateExistingPivot($participantId, ['presenceStatus' => $presenceStatus]);
        } else {
            $jourSession->participants()->attach($participantId, ['presenceStatus' => $presenceStatus, 'session_id' => $sessionId]);
        }

        return response()->json(['message' => 'Presence est modifiée avec succès !']);
    }

    public function getParticipantsBySessionId($sessionId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $session = Session::find($sessionId);

        if (!$session) {
            return response()->json(['error' => 'Session non trouvée !'], 404);
        }

        $participants = $session->participants;

        return response()->json($participants);
    }

    public function getPresenceStatusForParticipants($sessionId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $session = Session::with('jour_sessions.participants')->find($sessionId);

        if (!$session) {
            return response()->json(['error' => 'Session non trouvée !'], 404);
        }

        $participantsStatus = $session->jour_sessions->flatMap(function ($jourSession) {
            return $jourSession->participants->map(function ($participant) use ($jourSession) {
                return [
                    'participant_id' => $participant->id,
                    'presence_status' => $participant->pivot->presenceStatus,
                    'jourSession_id' => $jourSession->id
                ];
            });
        });

        return response()->json($participantsStatus);
    }
}
