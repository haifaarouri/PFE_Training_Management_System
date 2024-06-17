<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formulaire extends Model
{
    use HasFactory;
    protected $fillable = ['surveyId', 'surveyLink', 'session_ids'];

    protected $casts = [
        'session_ids' => 'array',
    ];

    public function sessions()
    {
        return $this->belongsToMany(Session::class, 'formulaire_session');
    }
}
