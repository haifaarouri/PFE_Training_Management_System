<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formateur extends Model
{
    use HasFactory;

    protected $fillable = [
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'speciality',
        'experience',
        'type',
        'cv'
    ];

    protected static function boot()
    {
        parent::boot();

        // Before deleting a Formateur model, delete all related Certificat models and disponibilities
        static::deleting(function ($formateur) {
            $formateur->certificats()->delete();
            $formateur->disponibilities()->delete();
        });
    }

    public function certificats()
    {
        return $this->hasMany(Certificat::class, 'formateur_id', 'id');
    }

    public function disponibilities()
    {
        return $this->hasMany(Disponibility::class, 'formateur_id', 'id');
    }

    public function jourSessions()
    {
        return $this->hasMany(JourSession::class, 'formateur_id', 'id');
    }
}
