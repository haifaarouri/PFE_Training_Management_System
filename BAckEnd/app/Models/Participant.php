<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participant extends Model
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

    public function sessions()
    {
        return $this->belongsToMany(Session::class, 'participant_session')
            ->withPivot('participationStatus')
            ->withTimestamps();
    }
}
