<?php

namespace App\Http\Controllers;

use App\Models\Formation;
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

                $validator = Validator::make($request->all(), [
                    'title' => 'required|string|max:255',
                    'startDate' => 'required|date_format:"Y-m-d\TH:i"|start_date_not_before_today',
                    'endDate' => 'required|date_format:"Y-m-d\TH:i"|end_date_after_start_date',
                    'duration' => 'required|numeric',
                    'sessionMode' => ['required', new SessionModeRule()],
                    'reference' => 'required|string|max:255',
                    'location' => 'required|string|max:255',
                    'status' => ['required', new SessionStatusRule()],
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

    public function update(Request $request, $id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $session = Session::find($id);
                if (!$session) {
                    return response()->json(['error' => 'Session avec cette ID non trouvé !'], 404);
                }

                $validator = Validator::make($request->all(), [
                    'title' => 'required|string|max:255',
                    'startDate' => 'required|date_format:Y-m-d\TH:i',
                    'endDate' => 'required|date_format:Y-m-d\TH:i',
                    'duration' => 'required|numeric',
                    'sessionMode' => ['required', new SessionModeRule()],
                    'reference' => 'required|string|max:255',
                    'location' => 'required|string|max:255',
                    'status' => ['required', new SessionStatusRule()],
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                // Parse and set the start and end dates in UTC
                $session->startDate = Carbon::createFromFormat('Y-m-d\TH:i', $request->input('startDate'), 'UTC')->format('Y-m-d H:i:s');
                $session->endDate = Carbon::createFromFormat('Y-m-d\TH:i', $request->input('endDate'), 'UTC')->format('Y-m-d H:i:s');
                $session->title = $request->input('title');
                $session->duration = $request->input('duration');
                $session->sessionMode = $request->input('sessionMode');
                $session->reference = $request->input('reference');
                $session->location = $request->input('location');
                $session->status = $request->input('status');
                $session->save();

                return response()->json($session, 200);
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de la mise à jour du Session !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
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

}
