<?php

namespace App\Http\Controllers;

use App\Models\Candidat;
use App\Models\Session;
use App\Rules\CandidatTypeRule;
use Illuminate\Http\Request;
use App\Models\participant;
use Illuminate\Support\Facades\Validator;

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

        // Vérifier si le nombre maximum de participants est atteint
        if ($session->participants()->count() >= $session->max_participants) {
            return response()->json(['error' => 'La session a atteint le nombre maximum de participants !'], 400);
        }

        // Check if the session's formation is one of the formations the candidat has confirmed
        $confirmedFormationIds = $candidat->formations->where('pivot.registerStatus', 'Confirmé')->pluck('id');
        if (!in_array($session->formation_id, $confirmedFormationIds->toArray())) {
            return response()->json(['error' => 'Cette session n\'est pas liée à une formation confirmée par le candidat !'], 403);
        }

        try {
            $attributes = [
                'participationStatus' => "EnAttente",
            ];
            $participant->sessions()->attach($sessionId, $attributes);
            return response()->json(['message' => 'Participant inscrit à la session avec succès !']);
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) {
                return response()->json(['error' => 'Ce participant est déjà assigné à cette session !'], 400);
            }
            return response()->json(['error' => 'Erreur lors de la participation du participant à la formation.'], 500);
        } catch (\Exception $e) {
            \Log::error('Error attaching participant to session: ' . $e->getMessage());
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
}
