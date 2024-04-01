<?php

namespace App\Enums;

class TypeFormateur
{
    const EXTERNE = 'EXTERNE';
    const INTERNE = 'INTERNE';

    public static function all()
    {
        return [
            self::EXTERNE,
            self::INTERNE
        ];
    }

    public static function isValid($value)
    {
        return in_array($value, self::all());
    }
}