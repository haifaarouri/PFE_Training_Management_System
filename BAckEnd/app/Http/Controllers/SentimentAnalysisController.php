<?php

namespace App\Http\Controllers;

use App\Models\Formation;
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

    // public function getRecommendations($participantId)
    // {
    //     // Fetch data from your database
    //     $participant = Participant::with(['formations'])->find($participantId);

    //     if (!$participant) {
    //         return response()->json(['message' => 'No data found for participant ID: ' . $participantId], 404);
    //     }

    //     // Convert the data to an array
    //     $features = [
    //         'features' => $participant->formations->map(function ($formation) use ($participant) {
    //             return [
    //                 'reviewer_id' => $participant->id,
    //                 'course_id' => $formation->id,
    //                 // 'name' => $formation->entitled
    //             ];
    //         })->toArray()
    //     ];

    //     $lastCourse = $participant->formations->last();
    //     if (!$lastCourse) {
    //         return response()->json(['message' => 'No courses found for this participant'], 404);
    //     }

    //     // Send the data to the Flask API
    //     $response = $this->client->request('POST', 'http://localhost:5000/recommendations', [
    //         'json' => ['course_name' => $lastCourse->name]
    //         //  ['data' => $features]
    //     ]);
    //     \Log::info(json_decode($response->getBody(), true));
    //     if ($response->getStatusCode() != 200) {
    //         return response()->json(['error' => 'Failed to get recommendations'], 500);
    //     }

    //     // $responseBody = json_decode($response->getBody(), true);
    //     // return response()->json($responseBody);

    //     $courseraRecommendations = json_decode($response->getBody(), true)['results'];

    //     // Process recommendations
    //     $recommendations = [];
    //     foreach ($courseraRecommendations as $rec) {
    //         $courseName = $rec['course'];
    //         $distance = $rec['distance'];

    //         // Check if a similar formation exists in your database
    //         $similarFormation = Formation::where('name', 'LIKE', "%{$courseName}%")->first();

    //         if ($similarFormation) {
    //             $recommendations[] = [
    //                 'type' => 'internal',
    //                 'formation' => $similarFormation,
    //                 'similarity' => $distance
    //             ];
    //         } else {
    //             $recommendations[] = [
    //                 'type' => 'external',
    //                 'course_name' => $courseName,
    //                 'similarity' => $distance,
    //                 'message' => 'Similar course not available. Consider this as a future addition.'
    //             ];
    //         }
    //     }

    //     return response()->json([
    //         'recommendations' => $recommendations,
    //         'message' => 'Recommendations include both available formations and suggested external courses.'
    //     ]);
    // }

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

        // Prepare the data to send to the Flask API
        $course_name = $lastCourse->entitled;
        $n_recommendations = 5;

        // Send the data to the Flask API
        $response = $this->client->request('POST', 'http://localhost:5000/recommend', [
            'json' => [
                'course_name' => $course_name,
                'n_recommendations' => $n_recommendations
            ]
        ]);

        if ($response->getStatusCode() != 200) {
            return response()->json(['error' => 'Failed to get recommendations from the Flask API'], 500);
        }

        // Decode the response body to get recommendations
        $recommendations = json_decode($response->getBody(), true);

        // Check if there is an error key in the response
        if (isset($recommendations['error'])) {
            return response()->json(['error' => $recommendations['error']], 404);
        }

        // Fetch all courses from the database
        $allCourses = Formation::all();

        // Process recommendations and perform fuzzy matching to compare the recommendations with the courses in the database
        $formattedRecommendations = [];
        foreach ($recommendations as $rec) {
            $highestPercentage = 0;
            $bestMatch = null;

            foreach ($allCourses as $course) {
                similar_text($rec['course'], $course->entitled, $percent);
                if ($percent > $highestPercentage) {
                    $highestPercentage = $percent;
                    $bestMatch = $course;
                }
            }

            if ($highestPercentage > 50) { // Threshold for considering a match
                $formattedRecommendations[] = [
                    'type' => 'internal',
                    'course_name' => $bestMatch->entitled,
                    'similarity' => $highestPercentage,
                    'message' => 'Similar course available in our database.'
                ];
            } else {
                $formattedRecommendations[] = [
                    'type' => 'external',
                    'course_name' => $rec['course'],
                    'similarity' => $rec['distance'],
                    'message' => 'Consider this course as a future addition.'
                ];
            }
        }

        return response()->json([
            'recommendations' => $formattedRecommendations,
            'message' => 'Recommendations include both available formations and suggested external courses.'
        ]);
    }
}
