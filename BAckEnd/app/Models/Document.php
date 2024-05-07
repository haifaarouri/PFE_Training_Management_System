<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;
    protected $fillable = ['title', 'description', 'docName'];

    public function documentable()
    {
        return $this->morphTo();
    }
}
