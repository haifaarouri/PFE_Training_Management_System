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
    ];

    protected static function boot()
    {
        parent::boot();

        // Before deleting a Formateur model, delete all related Certificat models
        static::deleting(function ($formateur) {
            $formateur->certificats()->delete();
        });
    }

    public function certificats()
    {
        return $this->hasMany(Certificat::class, 'formateur_id', 'id');
    }

}
