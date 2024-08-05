<?php

namespace App\Http\Controllers;

use App\Models\Participant;
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

    public function getRecommendations($participantId)
    {
        $participant = Participant::with(['formations'])->find($participantId);

        if (!$participant) {
            return response()->json(['message' => 'No data found for participant ID: ' . $participantId], 404);
        }

        $lastCourse = $participant->formations->last();
        if (!$lastCourse) {
            return response()->json(['message' => 'No courses found for this participant'], 404);
        }

        try {
            $response = $this->client->request('POST', 'http://localhost:5000/recommend', [
                'json' => [
                    'course_name' => $lastCourse->entitled,
                    'n_recommendations' => 10
                ]
            ]);

            if ($response->getStatusCode() == 200) {
                $recommendations = json_decode($response->getBody(), true);
                if (isset($recommendations['error'])) {
                    return response()->json(['error' => $recommendations['error']], 404);
                }

                return response()->json([
                    'participantId' => $participantId,
                    'lastCourse' => $lastCourse->entitled,
                    'recommendations' => $recommendations,
                    'message' => 'Les recommandations ont été générées avec succès !'
                ]);
            } else {
                return response()->json(['error' => 'Failed to get recommendations from the Flask API'], $response->getStatusCode());
            }
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            \Log::error($e->getMessage());
            return response()->json(['error' => 'Erreur lors de la génération des recommendations des formations !'], 500);
        }
    }
}
