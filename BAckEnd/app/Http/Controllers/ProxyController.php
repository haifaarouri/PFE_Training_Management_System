<?php

namespace App\Http\Controllers;

use App\Models\Formulaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProxyController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function getAllSurveys()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $surveys = Formulaire::all();
            return response()->json($surveys);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function handle(Request $request)
    {
        $data = [
            'title' => $request->input('title'),
            'questions' => $request->input('questions'),
            // 'theme' => $request->input('theme'),
            'sessionIds' => $request->input('sessionIds'),
        ];

        $questions = json_decode($request->input('questions'), true);
        if (is_array($questions)) {
            $data['questions'] = $questions;
        } else {
            return response()->json(['error' => 'Invalid questions format'], 400);
        }

        $sessions = json_decode($request->input('sessionIds'), true);
        if (is_array($sessions)) {
            $data['sessionIds'] = $sessions;
        } else {
            return response()->json(['error' => 'Invalid sessionIds format'], 400);
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://script.google.com/macros/s/AKfycbzByRS_hpLFXbKXfYP8LxZ7O_Pl47U1_AG5CK7NfTFbdAH3wu5X35NmIYN9HFvpza68/exec', $data);

        if ($response->successful() && $response->json()) {
            $responseData = $response->json();

            if (isset($responseData['formId'])) {
                \Log::info($data['sessionIds']);
                $form = Formulaire::create([
                    'surveyId' => $responseData['formId'],
                    'surveyLink' => $responseData['publishedUrl'],
                    'session_ids' => $data['sessionIds']
                ]);

                return response()->json([
                    'data' => $responseData,
                    'publishedUrl' => $responseData['publishedUrl'] ?? 'No published URL found',
                    'form' => $form
                ])->header('Access-Control-Allow-Origin', '*');
            } else {
                return response()->json(['error' => 'L\'ID fu Formulaire non trouvé dans la réponse de google script !'], 400);
            }
        } else {
            \Log::error('Échec de la création du formulaire ou réponse non valide', [
                'response' => $response->body()
            ]);
            return response()->json([
                'error' => 'Échec de la création du formulaire ou réponse non valide !',
                'details' => $response->body()
            ], 500);
        }
    }

    public function getFormResponses(Request $request)
    {
        $data = [
            'surveyId' => $request->input('surveyId'),
            'sessionId' => $request->input('sessionId')
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://script.google.com/macros/s/AKfycbxCUk62z50bTIc2vtJPljuos4fzufUJiuZ11ijjxdSeDYby55VRLhQHqr33UkVWl8qg/exec', $data);

        if ($response->successful() && $response->json()) {
            $responseData = $response->json();

            return response()->json([
                'spreadsheetUrl' => $responseData['spreadsheetUrl'] ?? 'No spreadsheet URL found',
                'data' => $responseData['data'] ?? [],
            ])->header('Access-Control-Allow-Origin', '*');
        } else {
            \Log::error('Échec de la récupération des réponses du formulaire ou réponse non valide', [
                'response' => $response->body()
            ]);
            return response()->json([
                'error' => 'Échec de la récupération des réponses du formulaire ou réponse non valide',
                'details' => $response->body()
            ], 500);
        }
    }
}
