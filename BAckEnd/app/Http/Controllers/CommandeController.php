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

            $commandes = Commande::with(['produits.fournisseur.address'])->get();
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
                if ($request->input('produits.*.supplierEmailFromDB')) {
                    $validator = Validator::make($request->all(), [
                        'date' => 'required|date',
                        'quantity' => 'required|integer',
                        'total' => 'required|numeric',
                        'paymentMethod' => 'required|string|max:255',
                        'produits.*.name' => 'required|string|max:255',
                        'produits.*.price' => 'required|numeric',
                        'produits.*.category' => ['required', new ProductCategoryRule()],
                        'produits.*.supplierEmailFromDB' => 'required|email|max:255',
                    ]);

                    if ($validator->fails()) {
                        return response()->json(['error' => $validator->errors()], 400);
                    }

                    $commandeData = [
                        'date' => $request->input('date'),
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

                        $newProduit = new Produit($produitData);
                        $commande->produits()->save($newProduit);

                        $existingSupplier = Fournisseur::firstWhere('email', $produit['supplierEmailFromDB']);
                        $existingSupplier->produits()->save($newProduit);
                    }

                    return response()->json($commande, 201);
                } else {
                    $validator = Validator::make($request->all(), [
                        'date' => 'required|date',
                        'quantity' => 'required|integer',
                        'total' => 'required|numeric',
                        'paymentMethod' => 'required|string|max:255',
                        'produits.*.name' => 'required|string|max:255',
                        'produits.*.price' => 'required|numeric',
                        'produits.*.category' => ['required', new ProductCategoryRule()],
                        'produits.*.supplierName' => 'required|string|max:255',
                        'produits.*.email' => 'required|email|max:255|unique:fournisseurs',
                        'produits.*.supplierPhoneNumber' => 'required|string|max:8',
                        'produits.*.supplierPaymentConditions' => 'required|string|max:255',
                    ]);

                    if ($validator->fails()) {
                        return response()->json(['error' => $validator->errors()], 400);
                    }

                    $commandeData = [
                        'date' => $request->input('date'),
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
                            'email' => $produit['email'],
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

                }
            } catch (\Exception $e) {
                dd($e->getMessage());
                return response()->json(['error' => 'Erreur lors de l\'ajout de la commande !'], 500);
            }
        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function updateStatus($id, Request $request)
    {
        if (auth()->user()->role === 'PiloteDuProcessus') {

            $commande = Commande::find($id);

            $commande->status = $request->status;
            $commande->save();
            return response()->json(['message' => 'Commande est ' . $request->status . ' !']);

        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        if (auth()->user()->role !== 'PiloteDuProcessus') {

            $commande = Commande::find($id);

            $commande->status = "EnCours";
            $commande->save();
            return response()->json(['message' => 'Commande est en cours de traitement par le pilote de processus !']);

        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function getProducts()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $products = Produit::with('fournisseur')->get();
            return response()->json($products);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function getSuppliers()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $suppliers = Fournisseur::all();
            return response()->json($suppliers);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $commande = Commande::with('produits.fournisseur.address')->find($id);
            if (!$commande) {
                return response()->json(['error' => 'Commande avec cette ID non trouvé !'], 404);
            }
            return response()->json($commande);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {

        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $commande = Commande::find($id);
                if (!$commande) {
                    return response()->json(['error' => 'Commande avec cette ID non trouvé !'], 404);
                }

                $validator = Validator::make($request->all(), [
                    
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                if ($request->has('certificates') && is_array($request->input('certificates'))) {
                    foreach ($request->input('certificates') as $certificate) {
                        $validator = Validator::make($certificate, [
                            'name' => 'required|string|max:255',
                            'organisme' => 'required|string|max:255',
                            'obtainedDate' => 'required|date',
                            'idCertificat' => 'nullable',
                            'urlCertificat' => 'nullable',
                        ]);

                        if ($validator->fails()) {
                            return response()->json(['error' => $validator->errors()], 400);
                        }

                        // Update certificates
                        $incomingCertificates = $request->input('certificates', []);
                        $currentCertificates = $Commande->certificats()->get()->keyBy('id');

                        foreach ($incomingCertificates as $certificateData) {
                            $certificateId = $certificateData['id'] ?? null;
                            if ($certificateId && $currentCertificates->has($certificateId)) {
                                // Update existing certificate
                                $currentCertificates[$certificateId]->update($certificateData);
                                $currentCertificates->forget($certificateId); // Remove from the collection to avoid deleting later
                            } else {
                                // Create new certificate
                                $Commande->certificats()->create($certificateData);
                            }
                        }

                        // Delete any certificates not included in the incoming data
                        foreach ($currentCertificates as $certificate) {
                            $certificate->delete();
                        }
                    }
                }

                $commande->firstName = $request->input('firstName');
                $commande->lastName = $request->input('lastName');
                $commande->email = $request->input('email');
                $commande->type = $request->input('type');
                $commande->phoneNumber = $request->input('phoneNumber');
                $commande->experience = $request->input('experience');
                $commande->cv = !empty($cvName) ? $cvName : $request->input('cv');
                $commande->save();

                return response()->json($commande, 200);
            } catch (\Exception $e) {
                dd($e->getMessage());
                return response()->json(['error' => 'Erreur lors de la mise à jour du Commande !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

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
