<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'startDate',
        'endDate',
        'duration',
        'sessionMode',
        'reference',
        'location',
        'status',
        'formation_id',
        'max_participants'
    ];

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    public function jour_sessions()
    {
        return $this->hasMany(JourSession::class, 'session_id', 'id');
    }

    public function attestations()
    {
        return $this->hasMany(CertificateOfAttendance::class);
    }

    public function participants()
    {
        return $this->belongsToMany(Participant::class, 'participant_session');
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    public function materials()
    {
        return $this->belongsToMany(Materiel::class, 'session_materiel')->withPivot('quantity', 'startDate', 'endDate');
    }
}
