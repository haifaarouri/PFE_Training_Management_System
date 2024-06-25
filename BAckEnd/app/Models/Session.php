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
        'max_participants',
        'min_participants',
        'registration_start',
        'registration_end'
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
        return $this->belongsToMany(Session::class, 'participant_session')
            ->withPivot('participationStatus', 'participant_id', 'session_id', 'waitlist_order', 'created_at', 'updated_at');
        // ->withTimestamps();
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    public function materials()
    {
        return $this->belongsToMany(Materiel::class, 'session_materiel')->withPivot('quantity', 'startDate', 'endDate');
    }

    public function participantsInWaitingList()
    {
        return $this->belongsToMany(Participant::class, 'participant_session')
            ->wherePivot('participationStatus', 'Waitlisted');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
