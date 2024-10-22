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
        'address',
        'type',
        'companyName'
    ];

    public function attestations()
    {
        return $this->hasMany(CertificateOfAttendance::class);
    }

    public function formations()
    {
        return $this->belongsToMany(Formation::class, 'candidat_formation')
            ->withPivot('registerDate', 'registerStatus', 'motivation', 'paymentMethod')
            ->withTimestamps();
    }
}
