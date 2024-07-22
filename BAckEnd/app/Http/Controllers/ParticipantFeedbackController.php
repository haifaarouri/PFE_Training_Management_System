<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\Participant;
use App\Models\Session;
use Illuminate\Http\Request;

class ParticipantFeedbackController extends Controller
{
    public function saveAverages(Request $request)
    {
        $averages = $request->input('averages');

        if (!is_array($averages)) {
            return response()->json(['error' => 'Invalid data format for averages'], 400);
        }

        foreach ($averages as $participantId => $data) {
            if (!is_array($data) || !isset($data['average']) || !isset($data['sessionId'])) {
                return response()->json(['error' => "Missing data for participant ID: $participantId"], 400);
            }

            $average = $data['average'];
            $sessionId = $data['sessionId'];

            $participant = Participant::find($participantId);

            if (!$participant) {
                return response()->json(['message' => 'Participant avec l\'Id : ' . $participantId . ' non trouvé !'], 404);
            }

            $session = Session::find($sessionId);
            if (!$session) {
                return response()->json(['message' => 'Session avec l\'Id : ' . $sessionId . ' non trouvé !'], 404);
            }

            $formationId = $this->getFormationIdForParticipant($participantId, $sessionId);

            $formation = Formation::find($formationId);
            if (!$formation) {
                return response()->json(['message' => 'Formation avec l\'Id : ' . $formationId . ' non trouvé !'], 404);
            }

            if ($formationId) {
                $participant->formations()->syncWithoutDetaching([
                    $formationId => ['averageFeedback' => $average]
                ]);
            }
        }

        return response()->json(['message' => 'Scores moyen de chaque participant enregistrés avec succès !']);
    }

    public function getFormationIdForParticipant($participantId, $sessionId)
    {
        $participant = Participant::find($participantId);

        if (!$participant) {
            return response()->json(['message' => 'Participant non trouvé !'], 404);
        }

        $session = $participant->sessions()->where('sessions.id', $sessionId)->first();

        if (!$session) {
            return response()->json(['message' => 'Session not found for this participant'], 404);
        }

        return $session->formation_id;
    }

    public function filterFeedbacks(Request $request)
    {
        $query = Participant::query();

        // Eager load formations and sessions
        $query->with(['formations.sessions']);

        // Apply filters based on the request
        if ($request->has('sessionTitle')) {
            $query->whereHas('formations.sessions', function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->sessionTitle . '%');
            });
        }
        if ($request->has('formationRef')) {
            $query->whereHas('formations', function ($q) use ($request) {
                $q->where('reference', 'like', '%' . $request->formationRef . '%');
            });
        }
        if ($request->has('formationEntitled')) {
            $query->whereHas('formations', function ($q) use ($request) {
                $q->where('entitled', 'like', '%' . $request->formationEntitled . '%');
            });
        }
        if ($request->has('firstNameParticipant')) {
            $query->where('firstName', 'like', '%' . $request->firstNameParticipant . '%');
        }
        if ($request->has('lastNameParticipant')) {
            $query->where('lastName', 'like', '%' . $request->lastNameParticipant . '%');
        }
        if ($request->has('emailParticipant')) {
            $query->where('email', 'like', '%' . $request->emailParticipant . '%');
        }

        $participants = $query->get();

        return response()->json($participants);
    }
}
