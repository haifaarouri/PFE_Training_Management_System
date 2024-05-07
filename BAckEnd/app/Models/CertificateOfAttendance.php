<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class CertificateOfAttendance extends Document
{
    use HasFactory;

    protected $fillable = ['candidat_id', 'session_id'];

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }

    public function session()
    {
        return $this->belongsTo(Session::class);
    }
}
