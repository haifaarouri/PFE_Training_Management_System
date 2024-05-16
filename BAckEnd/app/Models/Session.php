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
        return $this->hasMany(AttestationDePrésence::class);
    }
}
