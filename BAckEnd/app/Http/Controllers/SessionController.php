<?php

namespace App\Http\Controllers;

use App\Models\Disponibility;
use App\Models\Formateur;
use App\Models\Formation;
use App\Models\JourSession;
use App\Models\Materiel;
use App\Models\Salle;
use App\Models\Session;
use App\Rules\SessionModeRule;
use App\Rules\SessionStatusRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;

class SessionController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $sessions = Session::all();
            return response()->json($sessions);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function store(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                Validator::extend('start_date_not_before_today', function ($attribute, $value, $parameters, $validator) {
                    return Carbon::parse($value)->gte(Carbon::today());
                });

                Validator::extend('end_date_after_start_date', function ($attribute, $value, $parameters, $validator) {
                    $startDate = $validator->getData()['startDate'];
                    return Carbon::parse($value)->gte(Carbon::parse($startDate));
                });

                Validator::extend('within_session_dates', function ($attribute, $value, $parameters, $validator) {
                    $data = $validator->getData();
                    $startDate = Carbon::parse($data['startDate'])->startOfDay();
                    $endDate = Carbon::parse($data['endDate'])->endOfDay();
                    $dayDate = Carbon::parse($value)->startOfDay();
                    return $dayDate->between($startDate, $endDate);
                });

                $validator = Validator::make($request->all(), [
                    'title' => 'required|string|max:255',
                    'startDate' => 'required|date_format:"Y-m-d\TH:i"|start_date_not_before_today',
                    'endDate' => 'required|date_format:"Y-m-d\TH:i"|end_date_after_start_date',
                    'duration' => 'required|numeric',
                    'sessionMode' => ['required', new SessionModeRule()],
                    'reference' => 'required|string|max:255',
                    'location' => 'required|string|max:255',
                    'status' => ['required', new SessionStatusRule()],
                    'jours' => 'required|array',
                    'jours.*.day' => 'required|date|within_session_dates',
                    'jours.*.startTime' => 'required|date_format:H:i',
                    'jours.*.endTime' => 'required|date_format:H:i'
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                // Parse and set the start and end dates in UTC
                $startDate = Carbon::createFromFormat('Y-m-d\TH:i', $request->input('startDate'), 'UTC');
                $endDate = Carbon::createFromFormat('Y-m-d\TH:i', $request->input('endDate'), 'UTC');

                $formation = Formation::firstWhere('reference', $request->input('reference'));
                if (!$formation) {
                    return response()->json(['error' => 'Formation avec cette réference non trouvée !'], 404);
                }

                $session = new Session($request->all());
                $session->startDate = $startDate->format('Y-m-d H:i:s');
                $session->endDate = $endDate->format('Y-m-d H:i:s');
                $formation->sessions()->save($session);

                foreach ($request->jours as $jour) {
                    $jourSession = new JourSession([
                        'day' => $jour['day'],
                        'startTime' => $jour['startTime'],
                        'endTime' => $jour['endTime'],
                        'session_id' => $session->id
                    ]);
                    $jourSession->save();
                }

                return response()->json($session, 201);
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de l\'ajout du Session !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $session = Session::find($id);
            if (!$session) {
                return response()->json(['error' => 'Session avec cette ID non trouvé !'], 404);
            }
            return response()->json($session);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function getDaysOfSession($sessionID)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $jours = JourSession::where('session_id', $sessionID)->get();
            if ($jours->isEmpty()) {
                return response()->json(['error' => 'Aucun jour trouvé pour cette session !'], 404);
            }
            return response()->json($jours);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $session = Session::find($id);
        if (!$session) {
            return response()->json(['error' => 'Session non trouvée.'], 404);
        }

        try {
            Validator::extend('start_date_not_before_today', function ($attribute, $value, $parameters, $validator) {
                return Carbon::parse($value)->gte(Carbon::today());
            });

            Validator::extend('end_date_after_start_date', function ($attribute, $value, $parameters, $validator) {
                $startDate = $validator->getData()['startDate'];
                return Carbon::parse($value)->gte(Carbon::parse($startDate));
            });

            Validator::extend('within_session_dates', function ($attribute, $value, $parameters, $validator) {
                $data = $validator->getData();
                $startDate = Carbon::parse($data['startDate'])->startOfDay();
                $endDate = Carbon::parse($data['endDate'])->endOfDay();
                $dayDate = Carbon::parse($value)->startOfDay();
                return $dayDate->between($startDate, $endDate);
            });

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'startDate' => 'required|date_format:"Y-m-d\TH:i"|start_date_not_before_today',
                'endDate' => 'required|date_format:"Y-m-d\TH:i"|end_date_after_start_date',
                'duration' => 'required|numeric',
                'sessionMode' => ['required', new SessionModeRule()],
                'reference' => 'required|string|max:255',
                'location' => 'required|string|max:255',
                'status' => ['required', new SessionStatusRule()],
                'jours' => 'required|array',
                'jours.*.day' => 'required|date|within_session_dates',
                'jours.*.startTime' => 'required|date_format:H:i',
                'jours.*.endTime' => 'required|date_format:H:i'
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }

            // Update session details
            $session->update($request->only(['title', 'startDate', 'endDate', 'duration', 'sessionMode', 'reference', 'location', 'status']));

            if ($session !== $request->input('reference')) {
                $formation = Formation::firstWhere('reference', $request->input('reference'));
                if (!$formation) {
                    return response()->json(['error' => 'Formation avec cette réference non trouvée !'], 404);
                }
                $formation->sessions()->save($session);
            }

            // Clear existing JourSession entries
            JourSession::where('session_id', $session->id)->delete();

            // Update or create new JourSession entries
            foreach ($request->jours as $jour) {
                JourSession::create([
                    'session_id' => $session->id,
                    'day' => $jour['day'],
                    'startTime' => $jour['startTime'],
                    'endTime' => $jour['endTime']
                ]);
            }

            return response()->json($session, 200);
        } catch (\Exception $e) {
            \Log::error('Error updating session: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la mise à jour de la session.'], 500);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $session = Session::find($id);
            if (!$session) {
                return response()->json(['error' => 'Session avec cette ID non trouvé !'], 404);
            }

            $session->delete();
            return response()->json(['message' => 'Session supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function getSessionByCriteria($startDate, $endDate, $reference)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $formattedStartDate = Carbon::parse($startDate)->format('Y-m-d\TH:i');
        $formattedEndDate = Carbon::parse($endDate)->format('Y-m-d\TH:i');

        $session = Session::where('startDate', '>=', $formattedStartDate)
            ->where('endDate', '<=', $formattedEndDate)
            ->where('reference', $reference)
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Session not found.'], 404);
        }

        return response()->json($session);
    }

    public function reserveRoomForSessionDay(Request $request, $sessionId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $jourSessionId = $request->input('jourSessionId');
        $salleId = $request->input('salle_id');


        $jourSession = JourSession::find($jourSessionId);
        if (!$jourSession || $jourSession->session_id != $sessionId) {
            return response()->json(['error' => 'Jour de session non valide !'], 404);
        }

        //check for the capacity of the room
        $session = Session::findOrFail($sessionId);
        $salle = Salle::where('id', $salleId)
            ->where('capacity', '>=', $session->participants()->count())
            ->first();

        if (!$salle) {
            return response()->json(['error' => 'Aucune salle disponible avec la capacité requise !'], 404);
        }

        //check for the availability of the room
        if (!$this->isSalleAvailable($salleId, $jourSession->day, $jourSession->startTime, $jourSession->endTime)) {
            return response()->json(['error' => 'La salle n\'est pas disponible pour cette date et ces heures !'], 422);
        }

        $jourSession->salle_id = $salleId;
        $jourSession->save();

        return response()->json(['message' => 'Salle réservée avec succès pour le jour de la session !']);
    }

    //Before a Salle can be reserved, check if there are any JourSession records for the same Salle on the same day that overlap with the desired start and end times.
    private function isSalleAvailable($salleId, $day, $startTime, $endTime)
    {

        $conflicts = JourSession::where('salle_id', $salleId)
            ->where('day', $day)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('startTime', '<', $endTime)
                        ->where('endTime', '>', $startTime);
                });
            })
            ->exists();

        return !$conflicts;
    }

    public function isSalleReservedForDay($sessionID, $dayID)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $jourSession = JourSession::where('session_id', $sessionID)
            ->where('id', $dayID)
            ->first();

        if ($jourSession && $jourSession->salle_id) {
            $salle = Salle::find($jourSession->salle_id);
            return response()->json(['message' => 'Une salle est réservée pour ce jour de la session', 'salleBooked' => $salle]);
        } else {
            return response()->json(['message' => 'Aucune salle n\'est réservée pour ce jour de la session.']);
        }
    }

    public function getAvailableRoomsForDay($sessionID, $dayID)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $jourSession = JourSession::where('session_id', $sessionID)
            ->where('id', $dayID)
            ->first();

        if (!$jourSession) {
            return response()->json(['error' => 'Jour de session non trouvé !'], 404);
        }

        $startTime = $jourSession->startTime;
        $endTime = $jourSession->endTime;

        // Get available rooms for the specified day and time
        $availableRooms = Salle::whereDoesntHave('jourSessions', function ($query) use ($jourSession, $startTime, $endTime) {
            $query->where('day', $jourSession->day) // Ensure we're checking against the correct day
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->where(function ($qq) use ($startTime, $endTime) {
                        $qq->where('startTime', '<', $endTime)
                            ->where('endTime', '>', $startTime);
                    });
                });
        })->get();

        return response()->json($availableRooms);
    }

    public function reserveTrainerForSession(Request $request, $sessionId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $formateurId = $request->input('formateurId');
        $dayId = $request->input('dayId');

        $formateur = Formateur::find($formateurId);
        if (!$formateur) {
            return response()->json(['error' => 'Formateur non trouvé !'], 404);
        }

        $jourSession = JourSession::find($dayId);
        if (!$jourSession || $jourSession->session_id != $sessionId) {
            return response()->json(['error' => 'Jour de session non valide !'], 404);
        }

        // Check if the formateur is available on this day and time and his specialities
        $result = $this->isFormateurAvailable($formateurId, $jourSession->day, $jourSession->startTime, $jourSession->endTime, $sessionId);
        if (!$result['success']) {
            return response()->json(['error' => $result['message']], 422);
        }

        // Assign the formateur to the day session
        $jourSession->formateur_id = $formateurId;
        $jourSession->save();

        return response()->json(['message' => 'Formateur réservé avec succès pour le jour de la session !']);
    }

    private function isFormateurAvailable($formateurId, $day, $startTime, $endTime, $sessionId)
    {
        // Convert day to Carbon instance for comparison
        $dayCarbon = Carbon::parse($day)->startOfDay();

        // Check for any overlapping sessions
        $conflicts = JourSession::where('formateur_id', $formateurId)
            ->where('day', $day)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('startTime', '<', $endTime)
                    ->where('endTime', '>', $startTime);
            })
            ->exists();

        if ($conflicts) {
            return ['success' => false, 'message' => 'Le formateur a déjà une session à ces heures !'];
        }

        // Check formateur availability using startDate and endDate
        $available = Disponibility::where('formateur_id', $formateurId)
            ->where('startDate', '<=', $dayCarbon)
            ->where('endDate', '>=', $dayCarbon)
            ->exists();

        if (!$available) {
            return ['success' => false, 'message' => 'Le formateur n\'est pas disponible pendant ces dates !'];
        }

        // Check if formateur's specialty matches the session's formation requirement
        $session = Session::with('formation')->find($sessionId);
        if (!$session || !$session->formation) {
            return ['success' => false, 'message' => 'Session non trouvée !'];
        }

        if (!$session->formation) {
            return ['success' => false, 'message' => 'Formation non trouvée !'];
        }

        $formateur = Formateur::find($formateurId);
        if (!$formateur) {
            return ['success' => false, 'message' => 'Formateur non trouvé !'];
        }

        // Convert formateur specialties to an array
        $formateurSpecialities = explode(',', $formateur->speciality);
        $formationRequirements = explode(',', $session->formation->requirements);
        $formationCategory = $session->formation->sousCategory->category->category_name ?? null;
        $formationSubCategorie = $session->formation->sousCategory->sous_category_name ?? null;
        $formationSpecialties = array_merge($formationRequirements, [$formationCategory], [$formationSubCategorie]);
        $formationSpecialties = array_filter($formationSpecialties);
        $matches = array_intersect($formateurSpecialities, $formationSpecialties);

        if (empty($matches)) {
            return ['success' => false, 'message' => 'La spécialité du formateur ne correspond pas aux exigences de la formation !'];
        }

        return ['success' => true];
    }

    public function getJourSessionsForTrainer($formateurId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $jourSessions = JourSession::whereHas('formateur', function ($query) use ($formateurId) {
            $query->where('formateur_id', $formateurId);
        })->get();

        return response()->json($jourSessions);
    }

    public function getAvailableTrinersForDay($sessionID, $dayID)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $jourSession = JourSession::where('session_id', $sessionID)
            ->where('id', $dayID)
            ->first();

        if (!$jourSession) {
            return response()->json(['error' => 'Jour de session non trouvé !'], 404);
        }

        $day = $jourSession->day;
        $startTime = $jourSession->startTime;
        $endTime = $jourSession->endTime;

        // Get available trainers for the specified day and time
        $availableTrainers = Formateur::whereDoesntHave('jourSessions', function ($query) use ($day, $startTime, $endTime) {
            $query->where('day', $day) // Ensure we're checking against the correct day
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->where(function ($qq) use ($startTime, $endTime) {
                        $qq->where('startTime', '<', $endTime)
                            ->where('endTime', '>', $startTime);
                    });
                });
        })->whereHas('disponibilities', function ($query) use ($day) {
            $query->where('startDate', '<=', $day)
                ->where('endDate', '>=', $day);
        })->get();

        return response()->json($availableTrainers);
    }

    public function reserveMaterialsForSession(Request $request, $sessionId)
    {
        $session = Session::find($sessionId);
        if (!$session) {
            return response()->json(['error' => 'Session non trouvée !'], 404);
        }

        $type = $request->input('materialType');
        $requiredQuantity = $request->input('quantity');
        $sessionStartDate = Carbon::parse($session->startDate);
        $sessionEndDate = Carbon::parse($session->endDate);

        $materials = Materiel::where('type', $type)
            ->whereDoesntHave('sessions', function ($query) use ($sessionStartDate, $sessionEndDate) {
                $query->where(function ($q) use ($sessionStartDate, $sessionEndDate) {
                    $q->whereBetween('session_materiel.startDate', [$sessionStartDate, $sessionEndDate])
                        ->orWhereBetween('session_materiel.endDate', [$sessionStartDate, $sessionEndDate])
                        ->orWhere(function ($qq) use ($sessionStartDate, $sessionEndDate) {
                            $qq->where('session_materiel.startDate', '<', $sessionStartDate)
                                ->where('session_materiel.endDate', '>', $sessionEndDate);
                        });
                });
            })
            ->get();

        $availableQuantity = count($materials);

        if ($availableQuantity < $requiredQuantity) {
            return response()->json(['error' => 'Pas assez de matériel disponible !'], 422);
        }

        foreach ($materials as $material) {
            if ($requiredQuantity <= 0)
                break;
            // $useQuantity = min($material->quantityAvailable, $requiredQuantity);
            $availableQuantity -= $requiredQuantity;
            $material->save();
            $session->materials()->attach($material->id, ['quantity' => $requiredQuantity, 'startDate' => $sessionStartDate, 'endDate' => $sessionEndDate]);
            $requiredQuantity -= $requiredQuantity;
        }

        return response()->json(['message' => 'Materiaux réservés avec succès !']);
    }
}
