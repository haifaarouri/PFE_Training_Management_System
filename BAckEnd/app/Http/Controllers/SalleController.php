<?php

namespace App\Http\Controllers;

use App\Models\JourSession;
use App\Rules\DispositionRule;
use App\Rules\RoomStateRule;
// use DateTimeZone;
use Illuminate\Http\Request;
use App\Models\Salle;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
// use App\Types\Disponibility;
use DateTime;

class SalleController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $salles = Salle::all();
            return response()->json($salles);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function store(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'capacity' => 'required|integer',
                // 'disponibility' => 'required',
                'disposition' => ['required', new DispositionRule()],
                'state' => ['required', new RoomStateRule()],
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }

            if ($request->hasFile('image')) {
                $fileName = time() . $request->file('image')->getClientOriginalName();
                $request->image->move(public_path('sallePictures'), $fileName);

                // $salleDisponibilities = [];
                // foreach (json_decode($request->input('disponibility'), true) as $key => $value) {
                //     $startDate = new DateTime($value['startDate'], new DateTimeZone('UTC'));
                //     $endDate = new DateTime($value['endDate'], new DateTimeZone('UTC'));
                //     $salleDisponibilities[$key] = new Disponibility($startDate, $endDate);
                // }

                $salle = Salle::create([
                    'name' => $request->input('name'),
                    'capacity' => $request->input('capacity'),
                    // 'disponibility' => $salleDisponibilities,
                    'disposition' => $request->input('disposition'),
                    'state' => $request->input('state'),
                    'image' => $fileName,
                ]);

                return response()->json($salle, 201);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $salle = Salle::find($id);
            if (!$salle) {
                return response()->json(['error' => 'Salle avec cette ID non trouvé !'], 404);
            }
            return response()->json($salle);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $salle = Salle::find($id);
            if (!$salle) {
                return response()->json(['error' => 'Salle avec cette ID non trouvé !'], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'capacity' => 'required|integer',
                // 'disponibility' => 'required',
                'state' => ['required', new RoomStateRule()],
                'disposition' => ['required', new DispositionRule()],
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }

            if ($request->file('image') && $request->file('image')->isValid()) {

                $oldImagePath = public_path('sallePictures/' . $request->image);
                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                }

                $fileName = time() . $request->file('image')->getClientOriginalName();
                $request->image->move(public_path('sallePictures'), $fileName);

                // $salleDisponibilities = [];
                // foreach (json_decode($request->input('disponibility'), true) as $key => $value) {
                //     $startDate = new DateTime($value['startDate'], new DateTimeZone('UTC'));
                //     $endDate = new DateTime($value['endDate'], new DateTimeZone('UTC'));
                //     $salleDisponibilities[$key] = new Disponibility($startDate, $endDate);
                // }

                $salle->name = $request->input('name');
                $salle->capacity = $request->input('capacity');
                // $salle->disponibility = $salleDisponibilities;
                $salle->state = $request->input('state');
                $salle->disposition = $request->input('disposition');
                $salle->image = $fileName;

                $salle->save();
                return response()->json($salle, 200);
            } else {
                // $salleDisponibilities = [];
                // foreach (json_decode($request->input('disponibility'), true) as $key => $value) {
                //     $startDate = new DateTime($value['startDate'], new DateTimeZone('UTC'));
                //     $endDate = new DateTime($value['endDate'], new DateTimeZone('UTC'));
                //     $salleDisponibilities[$key] = new Disponibility($startDate, $endDate);
                // }

                $salle->name = $request->input('name');
                $salle->capacity = $request->input('capacity');
                // $salle->disponibility = $salleDisponibilities;
                $salle->state = $request->input('state');
                $salle->disposition = $request->input('disposition');
                $salle->image = $request->input('image');

                $salle->save();
                return response()->json($salle, 200);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $salle = Salle::find($id);
            if (!$salle) {
                return response()->json(['error' => 'Salle avec cette ID non trouvé !'], 404);
            }

            $oldImagePath = public_path('sallePictures/' . $salle->image);
            if (File::exists($oldImagePath)) {
                File::delete($oldImagePath);
            }

            $salle->delete();
            return response()->json(['message' => 'Salle supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function getJourSessionBySalle($salleId)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $jourSessions = JourSession::where('salle_id', $salleId)->get();

        if ($jourSessions->isEmpty()) {
            return response()->json(['message' => 'Pas de sessions trouvées pour cette salle !'], 404);
        }

        return response()->json($jourSessions);
    }
}