<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SessionImage extends Model
{
    use HasFactory;

    protected $fillable = ['session_id', 'path', 'type'];

    public function session()
    {
        return $this->belongsTo(Session::class);
    }
}
