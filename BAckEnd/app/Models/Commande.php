<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'status',
        'quantity',
        'total',
        'paymentMethod'
    ];

    public function produits()
    {
        return $this->hasMany(Produit::class);
    }
}