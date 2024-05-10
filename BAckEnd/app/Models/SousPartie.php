<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SousPartie extends Model
{
    use HasFactory;

    protected $fillable = ["description", "jour_formation_id"];

    public function jourFormation()
    {
        return $this->belongsTo(JourFormation::class);
    }
}
