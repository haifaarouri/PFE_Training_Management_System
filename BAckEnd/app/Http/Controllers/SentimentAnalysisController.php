<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;

class SentimentAnalysisController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function getSentiment(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $client = new Client();

            $feedbacks = json_decode($request->input('feedbacks'), true);
            if (is_array($feedbacks)) {
                $response = $client->request('POST', 'http://localhost:5000/analyze', [
                    'json' => ['feedbacks' => $request->feedbacks]
                ]);

                $responseBody = json_decode($response->getBody(), true);
                return response()->json($responseBody);
            } else {
                return response()->json(['error' => 'Invalid feedbacks format'], 400);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
}
