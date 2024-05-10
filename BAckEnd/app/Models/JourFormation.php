<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JourFormation extends Model
{
    use HasFactory;

    protected $fillable = ["dayName", "programme_formation_id"];

    public function programme()
    {
        return $this->belongsTo(ProgrammeFormation::class);
    }

    public function sousParties()
    {
        return $this->hasMany(SousPartie::class);
    }
}
