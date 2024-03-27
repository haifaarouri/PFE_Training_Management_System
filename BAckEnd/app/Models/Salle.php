<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\DispositionEnum;

class Salle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'capacity',
        'disponibility',
        'disposition',
        'image',
        'state'
    ];

    protected $casts = [
        'disponibility' => 'array',
    ];

    public function setDispositionAttribute($value)
    {
        if (!DispositionEnum::isValid($value)) {
            throw new \InvalidArgumentException("Invalid disposition value: $value");
        }
        $this->attributes['disposition'] = $value;
    }
}
