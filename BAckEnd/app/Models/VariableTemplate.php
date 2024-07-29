<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariableTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['variable_name', 'description', 'source_model', 'source_field', 'key_field'];

    public function documentTemplates()
    {
        return $this->belongsToMany(DocumentTemplate::class, 'document_template_variable');
    }

    public function emailTemplates()
    {
        return $this->belongsToMany(EmailTemplate::class, 'email_template_variable');
    }
}
