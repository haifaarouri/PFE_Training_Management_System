<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Fournisseur extends Model
{
    use HasFactory;

    protected $fillable = [
        "name",
        "email",
        "phoneNumber",
        "paymentConditions",
    ];

    public function produits()
    {
        return $this->hasMany(Produit::class);
    }

    public function address(): HasOne
    {
        return $this->hasOne(Address::class);
    }
}
