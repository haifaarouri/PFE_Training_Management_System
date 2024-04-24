<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;

    protected $fillable = [
        "name",
        "description",
        "personnesCible",
        "price",
        "requirements",
        "sous_categorie_id"
    ];

    public function sousCategorie()
    {
        return $this->belongsTo(SousCategorie::class);
    }
}
