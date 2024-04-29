<?php

namespace App\Http\Controllers;

use App\Events\OrderStatusUpdated;
use App\Models\Address;
use App\Models\Commande;
use App\Models\Fournisseur;
use App\Models\Notification;
use App\Models\Produit;
use App\Models\User;
use App\Rules\ProductCategoryRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
                $validator = Validator::make($request->all(), [
                    'date' => 'required|date',
                    'deliveryDate' => 'required|date',
                    'total' => 'required|numeric',
                    'paymentMethod' => 'required|string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $commandeData = [
                    'date' => $request->input('date'),
                    'deliveryDate' => $request->input('deliveryDate'),
                    'total' => $request->input('total'),
                    'paymentMethod' => $request->input('paymentMethod'),
                ];

                $commande = Commande::create($commandeData);

                foreach ($request->input('produits') as $produit) {
                    if ($produit['supplierEmailFromDB']) {
                        $validator = Validator::make($produit, [
                            'name' => 'required|string|max:255',
                            'price' => 'required|numeric',
                            'category' => ['required', new ProductCategoryRule()],
                            'quantity' => 'required|integer',
                            'supplierEmailFromDB' => 'required|email|max:255',
                        ]);

                        if ($validator->fails()) {
                            return response()->json(['error' => $validator->errors()], 400);
                        }

                        $produitData = [
                            'name' => $produit['name'],
                            'price' => $produit['price'],
                            'category' => $produit['category'],
                            'quantity' => $produit['quantity'],
                        ];

                        $newProduit = Produit::create($produitData);
                        $commande->produits()->save($newProduit);

                        $existingSupplier = Fournisseur::firstWhere('email', $produit['supplierEmailFromDB']);
                        $existingSupplier->produits()->save($newProduit);
                    } else {
                        $validator = Validator::make($produit, [
                            'name' => 'required|string|max:255',
                            'price' => 'required|numeric',
                            'category' => ['required', new ProductCategoryRule()],
                            'quantity' => 'required|integer',
                            'supplierName' => 'required|string|max:255',
                            'email' => 'required|email|max:255|unique:fournisseurs',
                            'supplierPhoneNumber' => 'required|string|max:8',
                            'supplierPaymentConditions' => 'required|string|max:255',
                            'numero_rue' => 'required|integer',
                            'nom_rue' => 'required|string|max:255',
                            'ville' => 'required|string|max:255',
                            'code_postal' => 'required|max:255',
                            'pays' => 'required|string|max:255',
                            'region' => 'required|string|max:255',
                        ]);

                        if ($validator->fails()) {
                            return response()->json(['error' => $validator->errors()], 400);
                        }

                        $produitData = [
                            'name' => $produit['name'],
                            'price' => $produit['price'],
                            'category' => $produit['category'],
                            'quantity' => $produit['quantity'],
                        ];

                        $newProduit = Produit::create($produitData);
                        $commande->produits()->save($newProduit);

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

                        $fournisseur->produits()->save($newProduit);
                    }
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

    public function updateStatus($id, Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            if ($request->status === "EnCours" && auth()->user()->role !== "PiloteDuProcessus") {
                $commande = Commande::find($id);

                $commande->status = $request->status;
                $commande->save();

                $piloteDuProcessus = User::where('role', '=', "PiloteDuProcessus")->get();

                if (!$piloteDuProcessus) {
                    return response()->json(['error' => "Pas de Pilote Du Processus !"], 404);
                }

                foreach ($piloteDuProcessus as $user) {
                    event(new OrderStatusUpdated($commande, $user->id));

                    //store user notification in DB 
                    $notificationData = [
                        'content_id' => $commande->id,
                    ];

                    $user->notifications()->create($notificationData);
                }

                return response()->json(['message' => 'Le statut de la commande est ' . $request->status . ' !']);
            } else if ($request->status === "Confirmé" || $request->status === "Annulé" || $request->status === "Réceptionné") {
                $commande = Commande::find($id);

                $commande->status = $request->status;
                $commande->save();

                $assistanteAcceuil = User::where('role', '=', "AssistanceAcceuil")->get();

                if (!$assistanteAcceuil) {
                    return response()->json(['error' => "Pas d' assistant(e) d'acceuil !"], 404);
                }

                foreach ($assistanteAcceuil as $user) {
                    event(new OrderStatusUpdated($commande, $user->id));

                    //store user notification in DB 
                    $notificationData = [
                        'content_id' => $commande->id,
                    ];

                    $user->notifications()->create($notificationData);
                }

                return response()->json(['message' => 'Le statut de la commande est ' . $request->status . ' !']);
            } else if ($request->status === "Confirmé") {
                $commande = Commande::find($id);

                $commande->status = $request->status;
                $commande->save();

                $serviceFinancier = User::where('role', '=', "ServiceFinancier")->get();

                if (!$serviceFinancier) {
                    return response()->json(['error' => "Pas de Service Financier !"], 404);
                }

                foreach ($serviceFinancier as $user) {
                    event(new OrderStatusUpdated($commande, $user->id));

                    //store user notification in DB 
                    $notificationData = [
                        'content_id' => $commande->id,
                    ];

                    $user->notifications()->create($notificationData);
                }

                return response()->json(['message' => 'Le statut de la commande est ' . $request->status . ' !']);
            }
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
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $commande = Commande::find($id);
        if (!$commande) {
            return response()->json(['error' => 'Commande avec cette ID non trouvé !'], 404);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'deliveryDate' => 'required|date',
            'total' => 'required|numeric',
            'paymentMethod' => 'required|string|max:255',
            'produits.*.name' => 'required|string|max:255',
            'produits.*.price' => 'required|numeric',
            'produits.*.category' => ['required', new ProductCategoryRule()],
            'produits.*.quantity' => 'required|integer',
            // 'produits.*.supplierEmailFromDB' => 'sometimes|email|max:255',
            'produits.*.fournisseur.name' => 'sometimes|string|max:255',
            'produits.*.fournisseur.email' => 'sometimes|email|max:255|unique:fournisseurs,email,' . $id,
            'produits.*.fournisseur.phoneNumber' => 'sometimes|string|max:8',
            'produits.*.fournisseur.paymentConditions' => 'sometimes|string|max:255',
            'produits.*.fournisseur.address.numero_rue' => 'sometimes|integer',
            'produits.*.fournisseur.address.nom_rue' => 'sometimes|string|max:255',
            'produits.*.fournisseur.address.ville' => 'sometimes|string|max:255',
            'produits.*.fournisseur.address.code_postal' => 'sometimes|string|max:255',
            'produits.*.fournisseur.address.pays' => 'sometimes|string|max:255',
            'produits.*.fournisseur.address.region' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $commande->update([
            'date' => $request->input('date'),
            'deliveryDate' => $request->input('deliveryDate'),
            'total' => $request->input('total'),
            'paymentMethod' => $request->input('paymentMethod'),
        ]);

        foreach ($request->input('produits') as $produitInput) {
            $produitData = [
                'name' => $produitInput['name'],
                'price' => $produitInput['price'],
                'category' => $produitInput['category'],
                'quantity' => $produitInput['quantity'],
            ];

            if (isset($produitInput['id'])) {
                $produit = Produit::find($produitInput['id']);
                if ($produit) {
                    $produit->update($produitData);
                }
            } else {
                $produit = new Produit($produitData);
                $commande->produits()->save($produit);
            }

            $decodedSupplier = json_decode($produitInput['fournisseur'], true);

            if (isset($decodedSupplier['id'])) {
                $fournisseur = Fournisseur::find($decodedSupplier['id']);
                if ($fournisseur) {
                    $fournisseur->update([
                        'name' => $decodedSupplier['name'],
                        'email' => $decodedSupplier['email'],
                        'phoneNumber' => $decodedSupplier['phoneNumber'],
                        'paymentConditions' => $decodedSupplier['paymentConditions'],
                    ]);
                    if (isset($decodedSupplier['address'])) {
                        if ($decodedSupplier['address']['id']) {
                            $adresse = Address::find($decodedSupplier['address']['id']);
                            $adresse->update([
                                "numero_rue" => $decodedSupplier['address']['numero_rue'],
                                "nom_rue" => $decodedSupplier['address']['nom_rue'],
                                "ville" => $decodedSupplier['address']['id'],
                                "code_postal" => $decodedSupplier['address']['ville'],
                                "pays" => $decodedSupplier['address']['pays'],
                                "region" => $decodedSupplier['address']['region'],
                            ]);
                            $fournisseur->address()->save($adresse);
                        } else {
                            $adresse = new Address([
                                "numero_rue" => $decodedSupplier['address']['numero_rue'],
                                "nom_rue" => $decodedSupplier['address']['nom_rue'],
                                "ville" => $decodedSupplier['address']['id'],
                                "code_postal" => $decodedSupplier['address']['ville'],
                                "pays" => $decodedSupplier['address']['pays'],
                                "region" => $decodedSupplier['address']['region'],
                            ]);
                            $fournisseur->address()->save($adresse);
                        }
                    }
                    $fournisseur->produits()->save($produit);
                }
            } else {
                $fournisseur = new Fournisseur([
                    'name' => $decodedSupplier['name'],
                    'email' => $decodedSupplier['email'],
                    'phoneNumber' => $decodedSupplier['phoneNumber'],
                    'paymentConditions' => $decodedSupplier['paymentConditions'],
                ]);

                $adresse = new Address([
                    "numero_rue" => $decodedSupplier['address']['numero_rue'],
                    "nom_rue" => $decodedSupplier['address']['nom_rue'],
                    "ville" => $decodedSupplier['address']['id'],
                    "code_postal" => $decodedSupplier['address']['ville'],
                    "pays" => $decodedSupplier['address']['pays'],
                    "region" => $decodedSupplier['address']['region'],
                ]);
                $fournisseur->address()->save($adresse);
                $fournisseur->produits()->save($produit);
            }

            if (isset($produitInput['supplierEmailFromDB'])) {
                $fournisseur = Fournisseur::firstOrCreate(
                    ['email' => $produitInput['supplierEmailFromDB']],
                    [
                        'name' => $produitInput['supplierName'] ?? '',
                        'phoneNumber' => $produitInput['supplierPhoneNumber'] ?? '',
                        'paymentConditions' => $produitInput['supplierPaymentConditions'] ?? '',
                    ]
                );
            }

            $produit->fournisseur()->associate($fournisseur);
            $produit->save();
        }

        return response()->json(['message' => "Commande modifiée avec succès !"], 200);
    }

    public function readNotification($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $notification = Notification::find($id);
            if (!$notification) {
                return response()->json(['error' => 'Notification avec cette ID non trouvé !'], 404);
            }

            $notification->read = true;
            $notification->save();

            return response()->json(['message' => 'La notification est lue avec succès !']);

        } else {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

}
