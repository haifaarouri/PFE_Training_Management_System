<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Commande;
use App\Models\Fournisseur;
use App\Models\Produit;
use App\Rules\CommandeSatutsRule;
use App\Rules\ProductCategoryRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use DateTimeZone;
use DateTime;

class CommandeController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $commandes = Commande::with(['produits.fournisseur'])->get();
            return response()->json($commandes);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function store(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $validator = Validator::make($request->all(), [
                    'date' => 'required|date',
                    'status' => ['required', new CommandeSatutsRule()],
                    'quantity' => 'required|integer',
                    'total' => 'required|numeric',
                    'paymentMethod' => 'required|string|max:255',
                    'produits.*.name' => 'required|string|max:255',
                    'produits.*.price' => 'required|numeric',
                    'produits.*.category' => ['required', new ProductCategoryRule()],
                    'produits.*.supplierName' => 'required|string|max:255',
                    'produits.*.supplierEmail' => 'required|string|max:255',
                    'produits.*.supplierPhoneNumber' => 'required|string|max:8',
                    'produits.*.supplierPaymentConditions' => 'required|string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $commandeData = [
                    'date' => $request->input('date'),
                    'status' => $request->input('status'),
                    'quantity' => $request->input('quantity'),
                    'total' => $request->input('total'),
                    'paymentMethod' => $request->input('paymentMethod'),
                ];

                $commande = Commande::create($commandeData);

                foreach ($request->input('produits') as $produit) {
                    $produitData = [
                        'name' => $produit['name'],
                        'price' => $produit['price'],
                        'category' => $produit['category'],
                    ];

                    $fournisseurData = [
                        'name' => $produit['supplierName'],
                        'email' => $produit['supplierEmail'],
                        'phoneNumber' => $produit['supplierPhoneNumber'],
                        'paymentConditions' => $produit['supplierPaymentConditions'],
                    ];

                    $fournisseur = Fournisseur::create($fournisseurData);

                    $adresse = new Address([
                        'numero_rue' => $produit['numero_rue'],
                        'nom_rue' => $produit['nom_rue'],
                        'ville' => $produit['ville'],
                        'code_postal' => $produit['code_postal'],
                        'pays' => $produit['pays'],
                        'region' => $produit['region'],
                    ]);
                
                    $fournisseur->address()->save($adresse);

                    $produit = new Produit($produitData);
                    $commande->produits()->save($produit);
                    $fournisseur->produits()->save($produit);
                }

                return response()->json($commande, 201);

            } catch (\Exception $e) {
                dd($e->getMessage());
                return response()->json(['error' => 'Erreur lors de l\'ajout de la commande !'], 500);
            }
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }


    // public function store(Request $request)
    // {
    //     if ($this->list_roles->contains(auth()->user()->role)) {
    //         try {

    //             $validator = Validator::make($request->all(), [
    //                 'date' => 'required|date',
    //                 'status' => ['required', new CommandeSatutsRule()],
    //                 'quantity' => 'required|integer',
    //                 'total' => 'required|numeric',
    //                 'paymentMethod' => 'required|string|max:255',
    //             ]);

    //             if ($validator->fails()) {
    //                 return response()->json(['error' => $validator->errors()], 400);
    //             }

    //             $commande = Commande::create([
    //                 'date' => $request->input('date'),
    //                 'status' => $request->input('status'),
    //                 'quantity' => $request->input('quantity'),
    //                 'total' => $request->input('total'),
    //                 'paymentMethod' => $request->input('paymentMethod'),
    //             ]);

    //             if ($request->has('produits') && is_array($request->input('produits'))) {
    //                 $productsData = [];
    //                 foreach ($request->input('produits') as $produit) {
    //                     $validator = Validator::make($produit, [
    //                         'name' => 'required|string|max:255',
    //                         'price' => 'required|numeric',
    //                         'category' => ['required', new ProductCategoryRule()],
    //                     ]);

    //                     if ($validator->fails()) {
    //                         return response()->json(['error' => $validator->errors()], 400);
    //                     }

    //                     $productsData[] = [
    //                         'name' => $produit['name'],
    //                         'price' => $produit['price'],
    //                         'category' => $produit['category'],
    //                     ];
    //                 }

    //                 $commande->produits()->createMany($productsData);

    //                 $suppliersData = [];

    //                 $validator = Validator::make($produit, [
    //                     'supplierName' => 'required|string|max:255',
    //                     'supplierEmail' => 'required|string|max:255',
    //                     'supplierPhoneNumber' => 'required|string|max:8',
    //                     'supplierPaymentConditions' => 'required|string|max:255',
    //                 ]);

    //                 if ($validator->fails()) {
    //                     return response()->json(['error' => $validator->errors()], 400);
    //                 }

    //                 $suppliersData = [
    //                     'name' => $produit['supplierName'],
    //                     'email' => $produit['supplierEmail'],
    //                     'phoneNumber' => $produit['supplierPhoneNumber'],
    //                     'paymentConditions' => $produit['supplierPaymentConditions'],
    //                 ];

    //                 $fournisseur = Fournisseur::create($suppliersData);

    //                 // $adresse = Address::create([
    //                 //     'numero_rue' => $produit->fournisseur->numero_rue,
    //                 //     'nom_rue' => $produit->fournisseur->nom_rue,
    //                 //     'ville' => $produit->fournisseur->ville,
    //                 //     'code_postal' => $produit->fournisseur->code_postal,
    //                 //     'pays' => $produit->fournisseur->pays,
    //                 //     'region' => $produit->fournisseur->region,
    //                 // ]);

    //                 // $product->fournisseur()->addresse()->save($adresse);

    //                 $fournisseur->produits()->create($productsData);
    //             }
    //             return response()->json($commande, 201);
    //         } catch (\Exception $e) {
    //             dd($e->getMessage());
    //             return response()->json(['error' => 'Erreur lors de l\'ajout du Commande !'], 500);
    //         }
    //     } else {
    //         // User does not have access, return a 403 response
    //         return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
    //     }
    // }

    // public function show($id)
    // {
    //     if ($this->list_roles->contains(auth()->user()->role)) {
    //         $Commande = Commande::with('certificats', 'disponibilities')->find($id);
    //         if (!$Commande) {
    //             return response()->json(['error' => 'Commande avec cette ID non trouvé !'], 404);
    //         }
    //         return response()->json($Commande);
    //     } else {
    //         // User does not have access, return a 403 response
    //         return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
    //     }
    // }

    // public function update(Request $request, $id)
    // {

    //     if ($this->list_roles->contains(auth()->user()->role)) {
    //         try {
    //             $Commande = Commande::find($id);
    //             if (!$Commande) {
    //                 return response()->json(['error' => 'Commande avec cette ID non trouvé !'], 404);
    //             }

    //             $validator = Validator::make($request->all(), [
    //                 'firstName' => 'required|string|max:255',
    //                 'lastName' => 'required|string|max:255',
    //                 'email' => 'required|string|max:255',
    //                 'phoneNumber' => 'required|string|max:255|min:8',
    //                 'experience' => 'required|integer',
    //                 'type' => ['required', new TypeCommandeRule()],
    //             ]);

    //             if ($validator->fails()) {
    //                 return response()->json(['error' => $validator->errors()], 400);
    //             }

    //             if ($request->has('certificates') && is_array($request->input('certificates'))) {
    //                 foreach ($request->input('certificates') as $certificate) {
    //                     $validator = Validator::make($certificate, [
    //                         'name' => 'required|string|max:255',
    //                         'organisme' => 'required|string|max:255',
    //                         'obtainedDate' => 'required|date',
    //                         'idCertificat' => 'nullable',
    //                         'urlCertificat' => 'nullable',
    //                     ]);

    //                     if ($validator->fails()) {
    //                         return response()->json(['error' => $validator->errors()], 400);
    //                     }

    //                     // Update certificates
    //                     $incomingCertificates = $request->input('certificates', []);
    //                     $currentCertificates = $Commande->certificats()->get()->keyBy('id');

    //                     foreach ($incomingCertificates as $certificateData) {
    //                         $certificateId = $certificateData['id'] ?? null;
    //                         if ($certificateId && $currentCertificates->has($certificateId)) {
    //                             // Update existing certificate
    //                             $currentCertificates[$certificateId]->update($certificateData);
    //                             $currentCertificates->forget($certificateId); // Remove from the collection to avoid deleting later
    //                         } else {
    //                             // Create new certificate
    //                             $Commande->certificats()->create($certificateData);
    //                         }
    //                     }

    //                     // Delete any certificates not included in the incoming data
    //                     foreach ($currentCertificates as $certificate) {
    //                         $certificate->delete();
    //                     }
    //                 }
    //             }

    //             if ($request->has('disponibility') && is_array($request->input('disponibility'))) {

    //                 $incomingDisponibilities = $request->input('disponibility', []);
    //                 $currentDisponibilities = $Commande->disponibilities()->get()->keyBy('id');

    //                 foreach ($incomingDisponibilities as $disponibilityData) {
    //                     $disponibilityId = $disponibilityData['id'] ?? null;
    //                     if ($disponibilityId && $currentDisponibilities->has($disponibilityId)) {
    //                         $currentDisponibilities[$disponibilityId]->update($disponibilityData);
    //                         $currentDisponibilities->forget($disponibilityId);
    //                     } else {
    //                         $Commande->disponibilities()->create($disponibilityData);
    //                     }
    //                 }

    //                 foreach ($currentDisponibilities as $disponibility) {
    //                     $disponibility->delete();
    //                 }
    //             }

    //             $cvName = null;
    //             if ($request->hasFile('cv')) {
    //                 $cvName = time() . $request->file('cv')->getClientOriginalName();
    //                 $request->cv->move(public_path('TrainersCV'), $cvName);
    //             }

    //             $specialities = [];
    //             foreach (json_decode($request->input('specialities'), true) as $key => $value) {
    //                 $specialities[$key] = $value;
    //             }

    //             $specialitiesStr = implode(',', $specialities);

    //             $Commande->firstName = $request->input('firstName');
    //             $Commande->lastName = $request->input('lastName');
    //             $Commande->email = $request->input('email');
    //             $Commande->type = $request->input('type');
    //             $Commande->phoneNumber = $request->input('phoneNumber');
    //             $Commande->experience = $request->input('experience');
    //             $Commande->speciality = $specialitiesStr;
    //             $Commande->cv = !empty($cvName) ? $cvName : $request->input('cv');
    //             $Commande->save();

    //             return response()->json($Commande, 200);
    //         } catch (\Exception $e) {
    //             \Log::error('Error uploading file: ' . $e->getMessage());
    //             dd($e->getMessage());
    //             return response()->json(['error' => 'Erreur lors de la mise à jour du Commande !'], 500);
    //         }
    //     } else {
    //         // User does not have access, return a 403 response
    //         return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
    //     }
    // }

    // public function destroy($id)
    // {
    //     if ($this->list_roles->contains(auth()->user()->role)) {
    //         $Commande = Commande::find($id);
    //         if (!$Commande) {
    //             return response()->json(['error' => 'Commande avec cette ID non trouvé !'], 404);
    //         }

    //         $Commande->delete();
    //         return response()->json(['message' => 'Commande supprimée avec succès !']);
    //     } else {
    //         // User does not have access, return a 403 response
    //         return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
    //     }
    // }

}
