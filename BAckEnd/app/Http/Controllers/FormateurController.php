<?php

namespace App\Http\Controllers;

use App\Models\Formateur;
use App\Rules\TypeFormateurRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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

            $formateurs = Formateur::with('certificats')->get();
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
                    'email' => 'required|string|unique:formateurs|max:255',
                    'phoneNumber' => 'required|string|max:255|min:8',
                    'experience' => 'required|integer',
                    'type' => ['required', new TypeFormateurRule()],
                    'speciality' => 'required|string|max:255'
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $formateur = Formateur::create([
                    'firstName' => $request->input('firstName'),
                    'lastName' => $request->input('lastName'),
                    'email' => $request->input('email'),
                    'phoneNumber' => $request->input('phoneNumber'),
                    'experience' => $request->input('experience'),
                    'type' => $request->input('type'),
                    'speciality' => $request->input('speciality'),
                ]);

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
            $formateur = Formateur::with('certificats')->find($id);
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
                    'email' => 'required|string|max:255',
                    'phoneNumber' => 'required|string|max:255|min:8',
                    'experience' => 'required|integer',
                    'type' => ['required', new TypeFormateurRule()],
                    'speciality' => 'required|string|max:255'
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
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
                
                $formateur->firstName = $request->input('firstName');
                $formateur->lastName = $request->input('lastName');
                $formateur->email = $request->input('email');
                $formateur->type = $request->input('type');
                $formateur->phoneNumber = $request->input('phoneNumber');
                $formateur->experience = $request->input('experience');
                $formateur->speciality = $request->input('speciality');
                $formateur->save();

                return response()->json($formateur, 200);
            } catch (\Exception $e) {
                \Log::error('Error uploading file: ' . $e->getMessage());

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
}
