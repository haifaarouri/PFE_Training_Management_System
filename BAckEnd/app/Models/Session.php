<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    public function jour_sessions()
    {
        return $this->hasMany(JourSession::class, 'session_id', 'id');
    }

    public function attestations()
    {
        return $this->hasMany(AttestationDePrésence::class);
    }
}
