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
        "session_id"
    ];

    public function session()
    {
        return $this->belongsTo(Session::class, 'session_id', 'id');
    }
}
