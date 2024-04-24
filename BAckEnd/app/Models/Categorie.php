<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    use HasFactory;

    protected $fillable = ['categorie_name'];

    public function sousCategories()
    {
        return $this->hasMany(SousCategorie::class);
    }

    public function formations()
    {
        return $this->hasManyThrough(Formation::class, SousCategorie::class);
    }
}
