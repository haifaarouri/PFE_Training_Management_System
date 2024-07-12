<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;

class SentimentAnalysisController extends Controller
{
    public $list_roles = [];
    public $client;

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
        $this->client = new Client();
    }

    public function getSentiment(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $feedbacks = json_decode($request->input('feedbacks'), true);
            if (is_array($feedbacks)) {
                $response = $this->client->request('POST', 'http://localhost:5000/analyze', [
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

    public function getRecommendations($userId)
    {
        // Fetch data from your database
        $data = DB::table('your_table')
            ->select('reviewer_id', 'course_id', 'rating')
            ->where('reviewer_id', $userId)
            ->get();

        // Convert the data to an array
        $dataArray = $data->toArray();

        // Send the data to the Flask API
        $response = $this->client->request('POST', 'http://localhost:5000/recommendations', [
            'json' => ['data' => $dataArray]
        ]);

        if ($response->getStatusCode() != 200) {
            return response()->json(['error' => 'Failed to get recommendations'], 500);
        }

        $responseBody = json_decode($response->getBody(), true);
        return response()->json($responseBody);
    }
}
