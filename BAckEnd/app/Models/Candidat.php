<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidat extends Model
{
    use HasFactory;

    protected $fillable = [
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'type',
    ];

    public function attestations()
    {
        return $this->hasMany(AttestationDePrésence::class);
    }
}