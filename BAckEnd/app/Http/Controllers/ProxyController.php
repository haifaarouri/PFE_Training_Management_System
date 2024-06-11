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
        ];

        $questions = json_decode($request->input('questions'), true);
        if (is_array($questions)) {
            $data['questions'] = $questions;
        } else {
            return response()->json(['error' => 'Invalid questions format'], 400);
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://script.google.com/macros/s/AKfycbyrRC6Cb_p0oTo_YJaKUUfuSjvgj0FKTj5QHg4gi91FIuuEtef_U0SK_4CTnowlh5u2/exec', $data);

        if ($response->successful() && $response->json()) {
            $responseData = $response->json();

            if (isset($responseData['formId'])) {
                $form = Formulaire::create([
                    'surveyId' => $responseData['formId'],
                    'surveyLink' => $responseData['publishedUrl']
                ]);

                return response()->json([
                    'data' => $responseData,
                    'editUrl' => $responseData['editUrl'] ?? 'No edit URL found',
                    'form' => $form
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
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://script.google.com/macros/s/AKfycbzZEpoD9a3M97i2mvWz5gcYQ9spv7EbqcfrjkJjBKmxKLlkbyCp05rApXe-YKPhdEXb/exec', $request->surveyId);

        if ($response->successful() && $response->json()) {
            $responseData = $response->json();

            return response()->json([
                'data' => $responseData,
                'editUrl' => $responseData['editUrl'] ?? 'No edit URL found'
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
