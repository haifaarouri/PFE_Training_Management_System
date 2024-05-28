<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materiel extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'type',
        // 'quantityAvailable',
        'status',
        'purchaseDate',
        'cost',
        'supplier',
        'image',
        'technicalSpecifications'
    ];

    public function sessions()
    {
        return $this->belongsToMany(Session::class, 'session_materiel')->withPivot('quantity', 'startDate', 'endDate');
    }
}
