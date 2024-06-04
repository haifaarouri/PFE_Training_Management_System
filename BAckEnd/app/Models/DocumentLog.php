<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentLog extends Model
{
    use HasFactory;
    protected $fillable = ['participant_id', 'session_id', 'formation_id', 'document_type', 'generated_at', 'document_generated'];
}
