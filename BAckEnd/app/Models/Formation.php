<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;

    protected $fillable = [
        "reference",
        "entitled",
        "description",
        "numberOfDays",
        "personnesCible",
        "price",
        "requirements",
        "certificationOrganization",
        "courseMaterial",
        "sous_categorie_id",
        "partenaire_id"
    ];

    public function sousCategorie()
    {
        return $this->belongsTo(SousCategorie::class);
    }

    public function partenaire()
    {
        return $this->belongsTo(Partenaire::class);
    }

    public function programme()
    {
        return $this->hasOne(ProgrammeFormation::class, 'formation_id', 'id');
    }

    public function sessions()
    {
        return $this->hasMany(Session::class);
    }

    public function candidats()
    {
        return $this->belongsToMany(Candidat::class, 'candidat_formation');
    }

    public function participants()
    {
        return $this->belongsToMany(Participant::class, 'participant_feedback')
            ->withPivot('averageFeedback')
            ->withTimestamps();
    }
}
