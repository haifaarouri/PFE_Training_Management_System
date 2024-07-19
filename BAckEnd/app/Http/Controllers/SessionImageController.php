<?php

namespace App\Http\Controllers;

use App\Models\SessionImage;
use Cache;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class SessionImageController extends Controller
{
    public $list_roles = [];
    protected $client;


    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
        $this->client = new Client();
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
                    'session_id' => 'required|numeric'
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
                    $imageSession->session_id = $request->input('session_id');

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
                'session_id' => 'required|numeric'
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
                $imageSession->session_id = $request->input('session_id');

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

    public function shareOnLinkedIn(Request $request, $image_id)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $image = SessionImage::find($image_id);
        if (!$image) {
            return response()->json(['error' => 'Image non trouvée !'], 404);
        }

        $user = auth()->user();
        $accessToken = session('linkedin_access_token');  // Retrieve the access token from session

        if (!$accessToken) {
            return response()->json(['error' => 'Access token is missing. Please authenticate again.'], 401);
        }
        \Log::info(url('SessionImages/' . $image->path));
        try {
            $client = new Client();
            $response = $client->request('POST', 'https://api.linkedin.com/v2/ugcPosts', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json',
                    'X-Restli-Protocol-Version' => '2.0.0'
                ],
                'json' => [
                    "author" => "urn:li:person:" . $user->provider_id,
                    "lifecycleState" => "PUBLISHED",
                    "specificContent" => [
                        "com.linkedin.ugc.ShareContent" => [
                            "shareCommentary" => [
                                "text" => $request->message ?? 'Default share message'
                            ],
                            "shareMediaCategory" => "IMAGE",
                            "media" => [
                                [
                                    "status" => "READY",
                                    "description" => [
                                        "text" => "Description of the image"
                                    ],
                                    "media" => url('SessionImages/' . $image->path),
                                    "title" => [
                                        "text" => "Title of the image"
                                    ]
                                ]
                            ]
                        ]
                    ],
                    "visibility" => [
                        "com.linkedin.ugc.MemberNetworkVisibility" => "PUBLIC"
                    ]
                ]
            ]);

            if ($response->getStatusCode() == 200) {
                $image->is_shared_on_linkedin = true;
                $image->shared_message = $request->message ?? 'Default share message';
                $image->save();
                return response()->json(['message' => 'Partagé avec succès sur Linkedin !']);
            }

            // return response()->json(['message' => 'Shared successfully on LinkedIn!']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to share on LinkedIn: ' . $e->getMessage()], 500);
        }
    }

    public function exchangeCodeForAccessToken(Request $request)
    {
        $code = $request->code;
        $cacheKey = 'code_used_' . $code;

        if (Cache::has($cacheKey)) {
            return response()->json(['error' => 'Code has already been used'], 400);
        }

        $client_id = config('services.linkedin.client_id');
        $client_secret = config('services.linkedin.client_secret');
        $redirect_uri = config('services.linkedin.redirect');

        $response = $this->client->post('https://www.linkedin.com/oauth/v2/accessToken', [
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded'  // Ensure correct Content-Type
            ],
            'form_params' => [
                'grant_type' => 'authorization_code',
                'code' => $request->code,
                'redirect_uri' => $redirect_uri,
                'client_id' => $client_id,
                'client_secret' => $client_secret,
            ],
        ]);

        $accessToken = json_decode($response->getBody()->getContents(), true)['access_token'];
        Cache::put($cacheKey, true, 300); // Prevent reuse of the code for 5 minutes

        // Fetch user's LinkedIn profile to get personURN
        $profileResponse = $this->client->request('GET', 'https://api.linkedin.com/v2/userinfo', [
            'headers' => [
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json'
            ]
        ]);

        $profileData = json_decode($profileResponse->getBody()->getContents(), true);
        $personURN = $profileData['sub'];
        return response()->json(['accessToken' => $accessToken, 'personURN' => $personURN]);
    }

    public function registerMedia($accessToken, $personURN)
    {
        $response = $this->client->request('POST', 'https://api.linkedin.com/v2/assets?action=registerUpload', [
            'headers' => [
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
                'X-Restli-Protocol-Version' => '2.0.0'
            ],
            'json' => [
                'registerUploadRequest' => [
                    'recipes' => ['urn:li:digitalmediaRecipe:feedshare-image'],
                    'owner' => 'urn:li:person:' . $personURN,
                    'serviceRelationships' => [
                        [
                            'relationshipType' => 'OWNER',
                            'identifier' => 'urn:li:userGeneratedContent'
                        ]
                    ]
                ]
            ]
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    public function uploadMedia($uploadUrl, $imagePath, $accessToken)
    {
        $response = $this->client->request('PUT', $uploadUrl, [
            'headers' => [
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/octet-stream'
            ],
            'body' => fopen($imagePath, 'r')
        ]);

        return $response->getStatusCode();
    }

    public function createShare($accessToken, $personURN, $asset, $message)
    {
        $response = $this->client->request('POST', 'https://api.linkedin.com/v2/ugcPosts', [
            'headers' => [
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
                'X-Restli-Protocol-Version' => '2.0.0'
            ],
            'json' => [
                'author' => 'urn:li:person:' . $personURN,
                // "author" => "urn:li:organization:104499319",
                'lifecycleState' => 'PUBLISHED',
                'specificContent' => [
                    'com.linkedin.ugc.ShareContent' => [
                        'shareCommentary' => [
                            'text' => $message
                        ],
                        'shareMediaCategory' => 'IMAGE',
                        'media' => [
                            [
                                'status' => 'READY',
                                'description' => [
                                    'text' => 'Description of the image'
                                ],
                                'media' => $asset,
                                'title' => [
                                    'text' => 'Title of the image'
                                ]
                            ]
                        ]
                    ]
                ],
                'visibility' => [
                    'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'
                ]
            ]
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    public function shareImageOnLinkedIn(Request $request)
    {
        $accessToken = $request->accessToken;
        $personURN = $request->personURN;
        $imageId = $request->imageId;
        $message = $request->message;

        $image = SessionImage::find($imageId);

        if (!$image) {
            return response()->json(['error' => 'Image not found'], 404);
        }

        if (empty($imageId)) {
            return response()->json(['error' => 'Image ID cannot be empty'], 400);
        }

        try {
            $registerResponse = $this->registerMedia($accessToken, $personURN);
            $uploadUrl = $registerResponse['value']['uploadMechanism']['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']['uploadUrl'];
            $asset = $registerResponse['value']['asset'];

            $imagePath = public_path('SessionImages/' . $image->path);
            if (!File::exists($imagePath)) {
                return response()->json(['error' => 'Image file does not exist'], 404);
            }

            $this->uploadMedia($uploadUrl, $imagePath, $accessToken);  // Ensure accessToken is passed if needed
            $shareResponse = $this->createShare($accessToken, $personURN, $asset, $message);

            return response()->json(['message' => 'Image et message partagé avec succès sur LinkedIn !', 'data' => $shareResponse], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Echec de la partage de l\'image et du message sur LinkedIn : ' . $e->getMessage()], 500);
        }
    }
}
