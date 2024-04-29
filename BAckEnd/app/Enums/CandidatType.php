<?php

namespace App\Enums;

class CandidatType
{
    const Particulier = 'Particulier';
    const Organisme = 'Organisme';

    public static function all()
    {
        return [
            self::Particulier,
            self::Organisme,
        ];
    }

    public static function isValid($value)
    {
        return in_array($value, self::all());
    }
}