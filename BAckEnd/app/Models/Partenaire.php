<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partenaire extends Model
{
    use HasFactory;

    protected $fillable = [
        'companyName',
        'contactName',
        'email',
        'phoneNumber',
        'fax',
        'webSite',
        'adresse',
    ];

    public function formations()
    {
        return $this->hasMany(Formation::class);
    }
}
