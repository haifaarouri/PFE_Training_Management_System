<?php

namespace App\Http\Controllers;

use App\Models\CertificateOfAttendance;
use App\Models\Document;
use Exception;
use Illuminate\Http\Request;
use PhpOffice\PhpWord\TemplateProcessor;

class DocumentController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function store(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $validatedData = $request->validate([
                'title' => 'required|string',
                'description' => 'string',
                'candidat_id' => 'required|exists:candidats,id',
                'session_id' => 'required|exists:sessions,id',
            ]);

            if ($request->hasFile('docTemplate')) {
                try {
                    $fileName = time() . $request->file('docTemplate')->getClientOriginalName();
                    $request->docTemplate->move(public_path('DocumentsTemplates'), $fileName);

                    $my_template = new TemplateProcessor(public_path('DocumentsTemplates/' . $fileName));

                    $my_template->setValue('firstName', "test2");
                    $my_template->setValue('lastName', 'test2');

                    $attestation = new CertificateOfAttendance();
                    $attestation->candidat_id = $validatedData['candidat_id'];
                    $attestation->session_id = $validatedData['session_id'];
                    $attestation->save();

                    $document = new Document();
                    $document->title = $validatedData['title'];

                    $my_template->saveAs(public_path($document->title . $attestation->candidat_id . $attestation->candidat_id . '.docx'));

                    $document->description = $validatedData['description'];
                    $document->docName = $document->title . $attestation->candidat_id . $attestation->candidat_id . '.docx';
                    $document->documentable()->associate($attestation);
                    $document->save();

                } catch (Exception $exception) {
                    dd($exception);
                }

                return response()->json($document, 201);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
}
