<?php

namespace App\Http\Controllers;

use App\Models\SessionImage;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;

class imageSessionImageController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $imageSessions = SessionImage::all();
            return response()->json($imageSessions);
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
                    'path' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                    'type' => 'required|string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                if ($request->hasFile('path')) {
                    $fileName = time() . $request->file('path')->getClientOriginalName();
                    $request->path->move(public_path('SessionImages'), $fileName);

                    $imageSession = new SessionImage();
                    $imageSession->path = $fileName;
                    $imageSession->type = $request->input('type');

                    $imageSession->save();

                    return response()->json($imageSession, 201);
                }
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de l\'ajout du imageSession !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $imageSession = SessionImage::find($id);
            if (!$imageSession) {
                return response()->json(['error' => 'imageSession avec cette ID non trouvé !'], 404);
            }
            return response()->json($imageSession);
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

        $imageSession = SessionImage::find($id);
        if (!$imageSession) {
            return response()->json(['error' => 'Image de la Session non trouvée !'], 404);
        }

        try {

            $validator = Validator::make($request->all(), [
                'path' => 'required',
                'type' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }

            if ($request->file('path') && $request->file('path')->isValid()) {

                $oldImagePath = public_path('SessionImages/' . $request->path);
                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                }

                $fileName = time() . $request->file('path')->getClientOriginalName();
                $request->path->move(public_path('SessionImages'), $fileName);

                $imageSession->path = $fileName;
                $imageSession->type = $request->input('type');

                $imageSession->save();
                return response()->json($imageSession, 200);
            } else {
                $imageSession->path = $request->input('path');
                $imageSession->type = $request->input('type');

                $imageSession->save();
                return response()->json($imageSession, 200);
            }
        } catch (\Exception $e) {
            \Log::error('Error updating imageSession: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la mise à jour de la imageSession.'], 500);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $imageSession = SessionImage::find($id);
            if (!$imageSession) {
                return response()->json(['error' => 'imageSession avec cette ID non trouvé !'], 404);
            }

            $imageSession->delete();
            return response()->json(['message' => 'imageSession supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function shareOnLinkedIn(Request $request)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $image = SessionImage::find($request->image_id);
        if (!$image) {
            return response()->json(['error' => 'Image non trouvée !'], 404);
        }

        $user = auth()->user();
        if ($user->provider != 'linkedIn' && !$user->provider_token) {
            return response()->json(['error' => 'Vous devez vous authentifier avec LinkedIn !'], 401);
        }

        try {
            $client = new Client();
            $response = $client->request('POST', 'https://api.linkedin.com/v2/shares', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $user->provider_token,
                    'Content-Type' => 'application/json',
                    'X-Restli-Protocol-Version' => '2.0.0'
                ],
                'json' => [
                    'content' => [
                        'contentEntities' => [
                            [
                                'entityLocation' => url('SessionImages/' . $image->path),
                                'thumbnails' => [
                                    ['resolvedUrl' => url('SessionImages/' . $image->path)]
                                ]
                            ]
                        ],
                        'title' => 'Session Image'
                    ],
                    'distribution' => [
                        'linkedInDistributionTarget' => []
                    ],
                    'owner' => 'urn:li:person:' . $user->provider_id,
                    'text' => [
                        'text' => $request->message
                    ]
                ]
            ]);

            return response()->json(['message' => 'Partagé avec succès sur LinkedIn !']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to share on LinkedIn: ' . $e->getMessage()], 500);
        }
    }
}
