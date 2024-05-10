<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgrammeFormation extends Model
{
    use HasFactory;

    protected $fillable = [
        "title"
    ];

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    public function jourFormations()
    {
        return $this->hasMany(JourFormation::class);
    }
}
