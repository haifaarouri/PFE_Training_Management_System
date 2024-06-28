<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['type', 'docName'];

    public function variableTemplates()
    {
        return $this->belongsToMany(VariableTemplate::class, 'document_template_variable');
    }
}
