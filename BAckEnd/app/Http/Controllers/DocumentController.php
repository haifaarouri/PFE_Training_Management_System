<?php

namespace App\Http\Controllers;

use App\Models\CertificateOfAttendance;
use App\Models\Document;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\Settings;

class DocumentController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function convertToPdf($filePath)
    {
        if (!file_exists($filePath)) {
            return response()->json(['error' => "File does not exist: $filePath"], 404);
        }

        if (!is_readable($filePath)) {
            return response()->json(['error' => "File is not readable: $filePath"], 403);
        }

        // Set PDF renderer settings
        Settings::setPdfRendererName('DomPDF');
        Settings::setPdfRendererPath(base_path('vendor/dompdf/dompdf'));

        $phpWord = IOFactory::load($filePath);
        $pdfWriter = IOFactory::createWriter($phpWord, 'PDF');
        $pdfPath = str_replace('.docx', '.pdf', $filePath);
        $pdfWriter->save($pdfPath);
        return $pdfPath;
    }

    public function getAllTemplates(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $folderPath = public_path('DocumentsTemplates');
            $files = File::files($folderPath);

            $fileData = [];
            foreach ($files as $file) {
                $filePath = $file->getPathname();
                $fileExtension = pathinfo($filePath, PATHINFO_EXTENSION);

                // Check if the file has a PDF extension
                if ($fileExtension === 'pdf') {
                    // Process only PDF files
                    $fileData[] = $file->getFilename();
                }
            }

            return response()->json($fileData, 200);
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function uploadTemplate(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            if ($request->hasFile('docTemplate')) {
                try {
                    $folderPath = public_path('DocumentsTemplates');
                    $files = File::files($folderPath); // Get all files in the folder
                    $substring = $request->docType;

                    foreach ($files as $file) {
                        $fileName = $file->getFilename(); // Get the file name without extension

                        if (Str::contains($fileName, $substring)) {
                            return response()->json(["error" => "Modèle de type : " . $request->docType . " existe déjà !"], 409);
                        }
                    }

                    $fileName = $request->docType . '.' . $request->file('docTemplate')->getClientOriginalExtension();
                    $request->docTemplate->move(public_path('DocumentsTemplates'), $fileName);
                    return response()->json(["message" => "Modèle de type : " . $request->docType . " est enregistré avec succès !"], 200);
                } catch (Exception $exception) {
                    dd($exception);
                    return response()->json(['error' => $exception->getMessage()], 500);
                }
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
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
