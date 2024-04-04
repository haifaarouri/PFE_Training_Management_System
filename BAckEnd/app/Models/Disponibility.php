<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disponibility extends Model
{
    use HasFactory;

    protected $fillable = [
        "startDate",
        "endDate",
    ];

    public function formateur()
    {
        return $this->belongsTo(Formateur::class, 'formateur_id', 'id');
    }
}
