<?php

namespace App\Http\Controllers;

use App\Rules\DispositionRule;
use DateTimeZone;
use Illuminate\Http\Request;
use App\Models\Salle;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use App\Enums\DispositionEnum;
use App\Types\Disponibility;
use DateTime;

class SalleController extends Controller
{
    public function index()
    {
        if (auth()->user()->role === 'Admin') {
            $salles = Salle::all();
            return response()->json($salles);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function store(Request $request)
    {
        if (auth()->user()->role === 'Admin') {
            // dd($request->all());
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'capacity' => 'required|integer',
                'disponibility' => 'required',
                'disposition' =>  ['required', new DispositionRule()],
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }

            if ($request->hasFile('image')) {
                $fileName = time() . $request->file('image')->getClientOriginalName();
                $request->image->move(public_path('sallePictures'), $fileName);

                $salleDisponibilities = [];
                foreach (json_decode($request->input('disponibility'), true) as $key => $value) {
                    $startDate = new DateTime($value['startDate'], new DateTimeZone('UTC'));
                    $endDate = new DateTime($value['endDate'], new DateTimeZone('UTC'));
                    $salleDisponibilities[$key] = new Disponibility($startDate, $endDate);
                }

                // for ($i=0; $i < count($request->input('disponibility')); $i++) { 
                //     $salleDisponibilities = [
                //         new Disponibility(new DateTime('2024-03-20'), new DateTime('2024-03-25')),
                //         new Disponibility(new DateTime('2024-04-01'), new DateTime('2024-04-05')),
                //     ];
                // }

                $salle = Salle::create([
                    'name' => $request->input('name'),
                    'capacity' => $request->input('capacity'),
                    'disponibility' => $salleDisponibilities,
                    'disposition' => $request->input('disposition'),
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
        if (auth()->user()->role === 'Admin') {
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
        if (auth()->user()->role === 'Admin') {
            $salle = Salle::find($id);
            if (!$salle) {
                return response()->json(['error' => 'Salle avec cette ID non trouvé !'], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'capacity' => 'required|integer',
                'disponibility' => 'required|boolean',
                'disposition' => 'required|string|max:255'. implode(',', DispositionEnum::all()),
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
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

                $salle->name = $request->input('name');
                $salle->capacity = $request->input('capacity');
                $salle->disponibility = $request->input('disponibility');
                $salle->disposition = $request->input('disposition');
                $salle->image = $fileName;

                $salle->save();
                return response()->json($salle, 200);
            } else {
                $salle->name = $request->input('name');
                $salle->capacity = $request->input('capacity');
                $salle->disponibility = $request->input('disponibility');
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
        if (auth()->user()->role === 'Admin') {
            $salle = Salle::find($id);
            if (!$salle) {
                return response()->json(['error' => 'Salle avec cette ID non trouvé !'], 404);
            }

            $oldImagePath = public_path('sallePictures/' . $salle->image);
            if (File::exists($oldImagePath)) {
                File::delete($oldImagePath);
            }

            $salle->delete();
            return response()->json(null, 204);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
}