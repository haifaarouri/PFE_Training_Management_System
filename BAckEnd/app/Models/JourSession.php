<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JourSession extends Model
{
    use HasFactory;
    protected $fillable = [
        "day",
        "startTime",
        "endTime",
        "session_id",
        "salle_id"
    ];

    public function session()
    {
        return $this->belongsTo(Session::class, 'session_id', 'id');
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class, 'salle_id', 'id');
    }

    public function formateur()
    {
        return $this->belongsTo(Formateur::class, 'formateur_id', 'id');
    }

    public function participants()
    {
        return $this->belongsToMany(Participant::class, 'participant_jour_session')
            ->withPivot('presenceStatus', 'session_id')
            ->withTimestamps();
    }
}
