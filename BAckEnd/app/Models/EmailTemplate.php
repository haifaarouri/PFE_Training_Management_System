<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['type', 'subject', 'content', 'htmlContent', 'imageAttachement'];
    protected $casts = [
        'imageAttachement' => 'array'
    ];
}
