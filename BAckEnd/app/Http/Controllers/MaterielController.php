<?php

namespace App\Http\Controllers;

use App\Models\Materiel;
use App\Rules\StatusMaterielRule;
use App\Rules\TypeMaterielRule;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;

// use Pion\Laravel\ChunkUpload\Handler\HandlerFactory;
// use Pion\Laravel\ChunkUpload\Receiver\FileReceiver;

class MaterielController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $materiaux = Materiel::all();
            return response()->json($materiaux);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    // public function uploadChunk(Request $request)
    // {

    //     $receiver = new FileReceiver("file", $request, HandlerFactory::classFromRequest($request));

    //     if ($receiver->isUploaded() === false) {
    //         throw new \Exception('File not uploaded');
    //     }

    //     $save = $receiver->receive(); // receive the file
    //     if ($save->isFinished()) { // file uploading is complete / all chunks are uploaded
    //         $file = $save->getFile(); // get the saved file
    //         $extension = $file->getClientOriginalExtension();
    //         $fileName = str_replace('.' . $extension, '', $file->getClientOriginalName()) . '_' . md5(time()) . '.' . $extension;

    //         // $disk = Storage::disk(config('filesystems.default'));
    //         // $path = $disk->putFileAs('MaterialDocuments', $file, $fileName);
    //         $path = $file->move(public_path('MaterielDocs'), $fileName);


    //         // unlink($file->getPathname()); // delete chunked file
    //         return response()->json([
    //             'path' => asset('storage/' . $path),
    //             'filename' => $fileName
    //         ], 201);
    //     }

    //     // If we are here, it means the upload is still in progress (chunk mode)
    //     $handler = $save->handler();
    //     return response()->json([
    //         "done" => $handler->getPercentageDone(),
    //         'status' => true
    //     ]);
    // }

    public function store(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $validator = Validator::make($request->all(), [
                    'name' => 'required|string|max:255',
                    'quantityAvailable' => 'required|integer',
                    'type' => ['required', new TypeMaterielRule()],
                    'status' => ['required', new StatusMaterielRule()],
                    'purchaseDate' => 'required|date',
                    'cost' => 'required|numeric',
                    'supplier' => 'required|string|max:255',
                    'technicalSpecifications' => 'required|file|mimes:pdf|max:2048',
                    'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                if ($request->hasFile('image')) {
                    $fileName = time() . $request->file('image')->getClientOriginalName();
                    $request->image->move(public_path('MaterielPictures'), $fileName);

                    $docName = time() . $request->file('technicalSpecifications')->getClientOriginalName();
                    $request->technicalSpecifications->move(public_path('MaterielDocs'), $docName);

                    // $requestResumable = new Request(json_decode($request->resumable, true));

                    // $receiver = new FileReceiver("file", $request, HandlerFactory::classFromRequest($requestResumable));

                    // if ($receiver->isUploaded() === false) {
                    //     throw new \Exception('File not uploaded');
                    // }

                    // $save = $receiver->receive(); // receive the file
                    // if ($save->isFinished()) { // file uploading is complete / all chunks are uploaded
                    //     $file = $save->getFile(); // get the saved file
                    //     $extension = $file->getClientOriginalExtension();
                    //     $docName = str_replace('.' . $extension, '', $file->getClientOriginalName()) . '_' . md5(time()) . '.' . $extension;
                    //     $file->move(public_path('MaterielDocs'), $docName);

                    $materiel = Materiel::create([
                        'name' => $request->input('name'),
                        'type' => $request->input('type'),
                        'quantityAvailable' => $request->input('quantityAvailable'),
                        'status' => $request->input('status'),
                        'purchaseDate' => $request->input('purchaseDate'),
                        'cost' => $request->input('cost'),
                        'supplier' => $request->input('supplier'),
                        'technicalSpecifications' => $docName,
                        'image' => $fileName,
                    ]);

                    return response()->json($materiel, 201);
                    // }
                } else {
                    return response()->json(['error' => 'File not provided or missing.'], 400);
                }
            } catch (\Exception $e) {
                // Log the error for debugging
                \Log::error('Error uploading file: ' . $e->getMessage());
                // dd($e->getMessage());
                // Respond with a generic error message
                return response()->json(['error' => 'An error occurred while uploading the file.'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $materiel = Materiel::find($id);
            if (!$materiel) {
                return response()->json(['error' => 'Materiel avec cette ID non trouvé !'], 404);
            }
            return response()->json($materiel);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {

        if ($this->list_roles->contains(auth()->user()->role)) {
            $materiel = Materiel::find($id);
            if (!$materiel) {
                return response()->json(['error' => 'Materiel avec cette ID non trouvé !'], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'quantityAvailable' => 'required|integer',
                'type' => ['required', new TypeMaterielRule()],
                'status' => ['required', new StatusMaterielRule()],
                'purchaseDate' => 'required|date',
                'cost' => 'required|numeric',
                'supplier' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }

            // Handling image upload
            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                $oldImagePath = public_path('MaterielPictures/' . $materiel->image);
                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                }

                $fileImgName = time() . $request->file('image')->getClientOriginalName();
                $request->image->move(public_path('MaterielPictures'), $fileImgName);
                $materiel->image = $fileImgName;
            }

            // Handling technicalSpecifications upload
            if ($request->file('technicalSpecifications') && $request->hasFile('technicalSpecifications') && $request->file('technicalSpecifications')->isValid()) {
                $oldDocPath = public_path('MaterielDocs/' . $materiel->technicalSpecifications);
                if (File::exists($oldDocPath)) {
                    File::delete($oldDocPath);
                }

                $docName = time() . $request->file('technicalSpecifications')->getClientOriginalName();
                $request->technicalSpecifications->move(public_path('MaterielDocs'), $docName);
                $materiel->technicalSpecifications = $docName;
            }

            // Update other fields
            $materiel->name = $request->input('name');
            $materiel->type = $request->input('type');
            $materiel->quantityAvailable = $request->input('quantityAvailable');
            $materiel->status = $request->input('status');
            $materiel->purchaseDate = $request->input('purchaseDate');
            $materiel->cost = $request->input('cost');
            $materiel->supplier = $request->input('supplier');

            $materiel->save();

            return response()->json($materiel, 200);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    // public function update(Request $request, $id)
    // {
    //     if ($this->list_roles->contains(auth()->user()->role)) {
    //         $materiel = Materiel::find($id);
    //         if (!$materiel) {
    //             return response()->json(['error' => 'Materiel avec cette ID non trouvé !'], 404);
    //         }

    //         $validator = Validator::make($request->all(), [
    //             'name' => 'required|string|max:255',
    //             'quantityAvailable' => 'required|integer',
    //             'type' => ['required', new TypeMaterielRule()],
    //             'status' => ['required', new StatusMaterielRule()],
    //             'purchaseDate' => 'required|date',
    //             'cost' => 'required|numeric',
    //             'supplier' => 'required|string|max:255'
    //         ]);

    //         if ($validator->fails()) {
    //             return response()->json(['error' => $validator->errors()], 400);
    //         }

    //         if ($request->file('image') && $request->file('image')->isValid() && !$request->file('technicalSpecifications')) {

    //             $oldImagePath = public_path('MaterielPictures/' . $request->image);
    //             if (File::exists($oldImagePath)) {
    //                 File::delete($oldImagePath);
    //             }

    //             $fileName = time() . $request->file('image')->getClientOriginalName();
    //             $request->image->move(public_path('MaterielPictures'), $fileName);

    //             $materiel->name = $request->input('name');
    //             $materiel->type = $request->input('type');
    //             $materiel->quantityAvailable = $request->input('quantityAvailable');
    //             $materiel->status = $request->input('status');
    //             $materiel->purchaseDate = $request->input('purchaseDate');
    //             $materiel->cost = $request->input('cost');
    //             $materiel->supplier = $request->input('supplier');
    //             $materiel->technicalSpecifications = $request->input('technicalSpecifications');
    //             $materiel->image = $fileName;

    //             $materiel->save();
    //             return response()->json($materiel, 200);
    //         } else if ($request->file('technicalSpecifications') && $request->file('technicalSpecifications')->isValid() && !$request->file('image')) {

    //             $oldtechnicalSpecificationsPath = public_path('MaterielDocs/' . $request->technicalSpecifications);
    //             if (File::exists($oldtechnicalSpecificationsPath)) {
    //                 File::delete($oldtechnicalSpecificationsPath);
    //             }

    //             $fileName = time() . $request->file('technicalSpecifications')->getClientOriginalName();
    //             $request->technicalSpecifications->move(public_path('MaterielDocs'), $fileName);

    //             $materiel->name = $request->input('name');
    //             $materiel->type = $request->input('type');
    //             $materiel->quantityAvailable = $request->input('quantityAvailable');
    //             $materiel->status = $request->input('status');
    //             $materiel->purchaseDate = $request->input('purchaseDate');
    //             $materiel->cost = $request->input('cost');
    //             $materiel->supplier = $request->input('supplier');
    //             $materiel->technicalSpecifications = $fileName;
    //             $materiel->image = $request->input('image');

    //             $materiel->save();
    //             return response()->json($materiel, 200);
    //         } else if ($request->file('technicalSpecifications') && $request->file('image')) {

    //             $oldImagePath = public_path('MaterielPictures/' . $request->image);
    //             if (File::exists($oldImagePath)) {
    //                 File::delete($oldImagePath);
    //             }

    //             $fileImgName = time() . $request->file('image')->getClientOriginalName();
    //             $request->image->move(public_path('MaterielPictures'), $fileImgName);

    //             $oldtechnicalSpecificationsPath = public_path('MaterielDocs/' . $request->technicalSpecifications);
    //             if (File::exists($oldtechnicalSpecificationsPath)) {
    //                 File::delete($oldtechnicalSpecificationsPath);
    //             }

    //             $fileName = time() . $request->file('technicalSpecifications')->getClientOriginalName();
    //             $request->technicalSpecifications->move(public_path('MaterielDocs'), $fileName);

    //             $materiel->name = $request->input('name');
    //             $materiel->type = $request->input('type');
    //             $materiel->quantityAvailable = $request->input('quantityAvailable');
    //             $materiel->status = $request->input('status');
    //             $materiel->purchaseDate = $request->input('purchaseDate');
    //             $materiel->cost = $request->input('cost');
    //             $materiel->supplier = $request->input('supplier');
    //             $materiel->technicalSpecifications = $fileName;
    //             $materiel->image = $fileImgName;

    //             $materiel->save();
    //             return response()->json($materiel, 200);
    //         } else {

    //             $materiel->name = $request->input('name');
    //             $materiel->type = $request->input('type');
    //             $materiel->quantityAvailable = $request->input('quantityAvailable');
    //             $materiel->status = $request->input('status');
    //             $materiel->purchaseDate = $request->input('purchaseDate');
    //             $materiel->cost = $request->input('cost');
    //             $materiel->supplier = $request->input('supplier');
    //             $materiel->technicalSpecifications = $request->input('technicalSpecifications');
    //             $materiel->image = $request->input('image');

    //             $materiel->save();
    //             return response()->json($materiel, 200);
    //         }
    //     } else {
    //         // User does not have access, return a 403 response
    //         return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
    //     }
    // }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $materiel = Materiel::find($id);
            if (!$materiel) {
                return response()->json(['error' => 'Materiel avec cette ID non trouvé !'], 404);
            }

            $oldImagePath = public_path('MaterielPictures/' . $materiel->image);
            if (File::exists($oldImagePath)) {
                File::delete($oldImagePath);
            }

            $materiel->delete();
            return response()->json(['message' => 'Materiel supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
}
