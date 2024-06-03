<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class EmailTemplateController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $emailTemplates = EmailTemplate::all();

            return response()->json($emailTemplates, );
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
    public function store(Request $request)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $request->validate([
            'emailType' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'imageAttachement' => 'nullable|array',
            'imageAttachement.*' => 'nullable|image|max:2048'
        ]);

        $template = new EmailTemplate();
        $template->type = $request->emailType;
        $template->subject = $request->subject;
        $template->content = $request->content;

        if ($request->has('imageAttachement')) {
            $images = [];
            foreach ($request->file('imageAttachement') as $img) {
                $fileName = time() . '_' . $img->getClientOriginalName();
                $img->move(public_path('emailAttachements'), $fileName);
                $images[] = $fileName;
            }

            $template->imageAttachement = json_encode($images);
        }

        $template->save();

        return response()->json(['message' => 'Modèle d\'e-mail enregistré avec succès !'], 201);
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $emailTemplate = EmailTemplate::find($id);
            if (!$emailTemplate) {
                return response()->json(['error' => 'Modèle d\'e-mail avec cette ID non trouvé !'], 404);
            }
            return response()->json($emailTemplate);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function deleteImagesAttachements(Request $request, $id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $emailTemplate = emailTemplate::find($id);
            if (!$emailTemplate) {
                return response()->json(['error' => 'Modèle d\'e-mail avec cette ID non trouvé !'], 404);
            }

            if ($request->has('deleteImages')) {
                $deleteImages = json_decode($request->deleteImages, true); // Decode JSON as an array

                if (is_array($deleteImages)) {
                    $existingImages = json_decode($emailTemplate->imageAttachement, true);

                    foreach ($deleteImages as $deleteImage) {
                        if (($key = array_search($deleteImage, $existingImages)) !== false) {
                            unset($existingImages[$key]);
                            // Optionally delete the file from the server
                            $file_path = public_path('emailAttachements') . '/' . $deleteImage;
                            if (file_exists($file_path)) {
                                unlink($file_path);
                            }
                        }
                    }

                    $emailTemplate->imageAttachement = json_encode(array_values($existingImages));
                }

                $emailTemplate->save();
            }
            return response()->json(['message' => 'Pièces jointes supprimées avec succès !'], 200);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {

        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $emailTemplate = emailTemplate::find($id);
                if (!$emailTemplate) {
                    return response()->json(['error' => 'Modèle d\'e-mail avec cette ID non trouvé !'], 404);
                }

                $validator = Validator::make($request->all(), [
                    'emailType' => 'required|string|max:255',
                    'subject' => 'required|string|max:255',
                    'content' => 'required|string',
                    'imageAttachement' => 'nullable|array',
                    'imageAttachement.*' => 'nullable|max:2048'
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $emailTemplate->type = $request->emailType;
                $emailTemplate->subject = $request->subject;
                $emailTemplate->content = $request->content;

                if ($request->has('imageAttachement')) {
                    $images = json_decode($emailTemplate->imageAttachement, true);
                    foreach ($request->imageAttachement as $img) {
                        if ($img instanceof UploadedFile) {
                            $fileName = time() . '_' . $img->getClientOriginalName();
                            $img->move(public_path('emailAttachements'), $fileName);
                            $images[] = $fileName;
                        }
                    }

                    $emailTemplate->imageAttachement = json_encode($images);
                }

                $emailTemplate->save();

                return response()->json($emailTemplate, 200);
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                dd($e->getMessage());
                return response()->json(['error' => 'Erreur lors de la mise à jour du modèle d\'e-mail !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $emailTemplate = EmailTemplate::find($id);
            if (!$emailTemplate) {
                return response()->json(['error' => 'Modèle d\'e-mail avec cette ID non trouvé !'], 404);
            }

            $emailTemplate->delete();
            return response()->json(['message' => 'Modèle d\'e-mail supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
}
