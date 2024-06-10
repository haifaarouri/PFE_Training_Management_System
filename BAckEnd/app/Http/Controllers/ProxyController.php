<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProxyController extends Controller
{
    public function handle(Request $request)
    {
        $data = [
            'title' => $request->input('title'),
            'questions' => $request->input('questions'),
            'theme' => $request->input('theme'),
        ];

        $questions = json_decode($request->input('questions'), true);
        if (is_array($questions)) {
            $data['questions'] = $questions;
        } else {
            return response()->json(['error' => 'Invalid questions format'], 400);
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://script.google.com/macros/s/AKfycbyjkDXmTX3eiKaAqZoeQFlW2tyHCLC3w9-4Csgon0vAijQRVQq_uxBI7d35Iz4KME72/exec', $data);

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
