<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;

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
                $images[] = 'emailAttachments/' . $fileName;
            }

            $template->imageAttachement = json_encode($images);
        }

        $template->save();

        return response()->json(['message' => 'Modèle d\'e-mail enregistré avec succès !'], 201);
    }
}
