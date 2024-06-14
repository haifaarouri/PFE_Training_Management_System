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
            'sessionIds' => $request->input('sessionIds')
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
        ])->post('https://script.google.com/macros/s/AKfycbzXtJdxK_R_csNk-l3SOyw6_bHccsq7b8ly2tI2hIEiTXafjMlBmg66XOw-JYnM9Lmo/exec', $data);

        if ($response->successful() && $response->json()) {
            $responseData = $response->json();

            if (isset($responseData['formId'])) {
                foreach ($data['sessionIds'] as $sessionId) {
                    Formulaire::create([
                        'surveyId' => $responseData['formId'],
                        'surveyLink' => $responseData['publishedUrl'],
                        'sessionId' => $sessionId
                    ]);
                }

                return response()->json([
                    'data' => $responseData,
                    'editUrl' => $responseData['editUrl'] ?? 'No edit URL found',
                ])->header('Access-Control-Allow-Origin', '*');
            } else {
                return response()->json(['error' => 'formId not found in the response'], 400);
            }
        } else {
            \Log::error('Failed to create form or invalid response', [
                'response' => $response->body()
            ]);
            return response()->json([
                'error' => 'Failed to create form or invalid response',
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
        ])->post('https://script.google.com/macros/s/AKfycbwObuwleTrecUA_KEEyhJzULrxsPqlLxqAiCqfBmV8K8g2PG9QfJC3z2fU_rdFHb1bb/exec', $data);

        if ($response->successful() && $response->json()) {
            $responseData = $response->json();

            return response()->json([
                'spreadsheetUrl' => $responseData['spreadsheetUrl'] ?? 'No spreadsheet URL found',
                'data' => $responseData['data'] ?? [],
            ])->header('Access-Control-Allow-Origin', '*');
        } else {
            \Log::error('Failed to create form or invalid response', [
                'response' => $response->body()
            ]);
            return response()->json([
                'error' => 'Failed to create form or invalid response',
                'details' => $response->body()
            ], 500);
        }
    }
}
