<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'deliveryDate',
        'status',
        'total',
        'paymentMethod',
        'session_id'
    ];

    public function produits()
    {
        return $this->hasMany(Produit::class);
    }

    public function session() {
        return $this->belongsTo(Session::class);
    }
}
