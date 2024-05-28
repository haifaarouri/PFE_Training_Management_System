<?php

namespace App\Http\Controllers;

use App\Models\Formateur;
use App\Rules\TypeFormateurRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use DateTimeZone;
use DateTime;

class FormateurController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $formateurs = Formateur::with('certificats', 'disponibilities')->get();
            return response()->json($formateurs);
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
                    'email' => 'required|string|email|unique:formateurs|max:255',
                    'phoneNumber' => 'required|string|max:255|min:8',
                    'experience' => 'required|integer',
                    'type' => ['required', new TypeFormateurRule()],
                    'cv' => 'required|file|mimes:pdf,jpeg,png,jpg|max:2048'
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $cvName = null;
                if ($request->hasFile('cv')) {
                    $cvName = time() . $request->file('cv')->getClientOriginalName();
                    $request->cv->move(public_path('TrainersCV'), $cvName);
                } else {
                    return response()->json(['error' => 'File not provided or missing.'], 400);
                }

                $specialities = [];
                foreach (json_decode($request->input('specialities'), true) as $key => $value) {
                    $specialities[$key] = $value;
                }

                $specialitiesStr = implode(',', $specialities);

                $formateur = Formateur::create([
                    'firstName' => $request->input('firstName'),
                    'lastName' => $request->input('lastName'),
                    'email' => $request->input('email'),
                    'phoneNumber' => $request->input('phoneNumber'),
                    'experience' => $request->input('experience'),
                    'type' => $request->input('type'),
                    'speciality' => $specialitiesStr,
                    'cv' => $cvName
                ]);

                if ($request->has('disponibility') && is_array($request->input('disponibility'))) {
                    $disponibilities = [];
                    foreach ($request->input('disponibility') as $disponibility) {
                        $validator = Validator::make($disponibility, [
                            'startDate' => 'required|date',
                            'endDate' => 'required|date'
                        ]);

                        if ($validator->fails()) {
                            return response()->json(['error' => $validator->errors()], 400);
                        }

                        $disponibilities[] = [
                            'startDate' => new DateTime($disponibility['startDate'], new DateTimeZone('UTC')),
                            'endDate' => new DateTime($disponibility['endDate'], new DateTimeZone('UTC'))
                        ];
                    }

                    $formateur->disponibilities()->createMany($disponibilities);
                }

                if ($request->has('certificates') && is_array($request->input('certificates'))) {
                    $certificatesData = [];
                    foreach ($request->input('certificates') as $certificate) {
                        $validator = Validator::make($certificate, [
                            'name' => 'required|string|max:255',
                            'organisme' => 'required|string|max:255',
                            'obtainedDate' => 'required|date',
                            'idCertificat' => 'nullable',
                            'urlCertificat' => 'nullable',
                        ]);

                        if ($validator->fails()) {
                            return response()->json(['error' => $validator->errors()], 400);
                        }

                        $certificatesData[] = [
                            'name' => $certificate['name'],
                            'organisme' => $certificate['organisme'],
                            'obtainedDate' => $certificate['obtainedDate'],
                            'idCertificat' => !empty($certificate['idCertificat']) ? $certificate['idCertificat'] : null,
                            'urlCertificat' => !empty($certificate['urlCertificat']) ? $certificate['urlCertificat'] : null,
                        ];
                    }

                    $formateur->certificats()->createMany($certificatesData);
                }

                return response()->json($formateur, 201);
            } catch (\Exception $e) {
                \Log::error('Error uploading file: ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de l\'ajout du formateur !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $formateur = Formateur::with('certificats', 'disponibilities')->find($id);
            if (!$formateur) {
                return response()->json(['error' => 'Formateur avec cette ID non trouvé !'], 404);
            }
            return response()->json($formateur);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {

        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $formateur = Formateur::find($id);
                if (!$formateur) {
                    return response()->json(['error' => 'Formateur avec cette ID non trouvé !'], 404);
                }

                $validator = Validator::make($request->all(), [
                    'firstName' => 'required|string|max:255',
                    'lastName' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255',
                    'phoneNumber' => 'required|string|max:255|min:8',
                    'experience' => 'required|integer',
                    'type' => ['required', new TypeFormateurRule()],
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                if ($request->has('certificates') && is_array($request->input('certificates'))) {
                    foreach ($request->input('certificates') as $certificate) {
                        $validator = Validator::make($certificate, [
                            'name' => 'required|string|max:255',
                            'organisme' => 'required|string|max:255',
                            'obtainedDate' => 'required|date',
                            'idCertificat' => 'nullable',
                            'urlCertificat' => 'nullable',
                        ]);

                        if ($validator->fails()) {
                            return response()->json(['error' => $validator->errors()], 400);
                        }

                        // Update certificates
                        $incomingCertificates = $request->input('certificates', []);
                        $currentCertificates = $formateur->certificats()->get()->keyBy('id');

                        foreach ($incomingCertificates as $certificateData) {
                            $certificateId = $certificateData['id'] ?? null;
                            if ($certificateId && $currentCertificates->has($certificateId)) {
                                // Update existing certificate
                                $currentCertificates[$certificateId]->update($certificateData);
                                $currentCertificates->forget($certificateId); // Remove from the collection to avoid deleting later
                            } else {
                                // Create new certificate
                                $formateur->certificats()->create($certificateData);
                            }
                        }

                        // Delete any certificates not included in the incoming data
                        foreach ($currentCertificates as $certificate) {
                            $certificate->delete();
                        }
                    }
                }

                if ($request->has('disponibility') && is_array($request->input('disponibility'))) {

                    $incomingDisponibilities = $request->input('disponibility', []);
                    $currentDisponibilities = $formateur->disponibilities()->get()->keyBy('id');

                    foreach ($incomingDisponibilities as $disponibilityData) {
                        $disponibilityId = $disponibilityData['id'] ?? null;
                        if ($disponibilityId && $currentDisponibilities->has($disponibilityId)) {
                            $currentDisponibilities[$disponibilityId]->update($disponibilityData);
                            $currentDisponibilities->forget($disponibilityId);
                        } else {
                            $formateur->disponibilities()->create($disponibilityData);
                        }
                    }

                    foreach ($currentDisponibilities as $disponibility) {
                        $disponibility->delete();
                    }
                }

                $cvName = null;
                if ($request->hasFile('cv')) {
                    $cvName = time() . $request->file('cv')->getClientOriginalName();
                    $request->cv->move(public_path('TrainersCV'), $cvName);
                }

                $specialities = [];
                foreach (json_decode($request->input('specialities'), true) as $key => $value) {
                    $specialities[$key] = $value;
                }

                $specialitiesStr = implode(',', $specialities);

                $formateur->firstName = $request->input('firstName');
                $formateur->lastName = $request->input('lastName');
                $formateur->email = $request->input('email');
                $formateur->type = $request->input('type');
                $formateur->phoneNumber = $request->input('phoneNumber');
                $formateur->experience = $request->input('experience');
                $formateur->speciality = $specialitiesStr;
                $formateur->cv = !empty($cvName) ? $cvName : $request->input('cv');
                $formateur->save();

                return response()->json($formateur, 200);
            } catch (\Exception $e) {
                \Log::error('Error uploading file: ' . $e->getMessage());
                dd($e->getMessage());
                return response()->json(['error' => 'Erreur lors de la mise à jour du formateur !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $formateur = Formateur::find($id);
            if (!$formateur) {
                return response()->json(['error' => 'Formateur avec cette ID non trouvé !'], 404);
            }

            $formateur->delete();
            return response()->json(['message' => 'Formateur supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function filterBySpeciality($speciality)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $formateurs = Formateur::where('speciality', 'LIKE', '%' . $speciality . '%')->get();
            if ($formateurs->isEmpty()) {
                return response()->json(['error' => 'Pas de formateurs avec cette spécialité !'], 404);
            }
            return response()->json($formateurs);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
}
