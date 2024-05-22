<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\JourSession;
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
            ->where('capacity', '>=', $session->participants_count)
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

    private function isSalleAvailable($salleId, $day, $startTime, $endTime)
    {
        $conflicts = JourSession::where('salle_id', $salleId)
            ->where('day', $day)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('startTime', [$startTime, $endTime])
                    ->orWhereBetween('endTime', [$startTime, $endTime]);
            })
            ->exists();

        return !$conflicts;
    }

    // public function reserveRoom(Request $request, $sessionId)
    // {
    //     $session = Session::findOrFail($sessionId);
    //     $salle = Salle::where('id', $request->salle_id)
    //         ->where('capacity', '>=', $session->participants_count)
    //         ->first();

    //     if (!$salle) {
    //         return response()->json(['error' => 'Aucune salle disponible avec la capacité requise !'], 404);
    //     }

    //     if (!$this->isSalleAvailable($salle, $session->startDate, $session->endDate)) {
    //         return response()->json(['error' => 'La salle n\'est pas disponible aux dates sélectionnées !'], 422);
    //     }

    //     $session->salle_id = $salle->id;
    //     $session->save();

    //     return response()->json(['message' => 'Salle réservée avec succès pour la session !', 'session' => $session]);
    // }

    // //This function is crucial for ensuring that a room is not double-booked for overlapping sessions
    // private function isSalleAvailable($salle, $startDate, $endDate)
    // {
    //     //parcourir la liste de sessions ($salle->sessions) qui sont déjà réservées dans cette salle
    //     foreach ($salle->sessions as $session) {
    //         if ($startDate < $session->endDate && $endDate > $session->startDate) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }
}
