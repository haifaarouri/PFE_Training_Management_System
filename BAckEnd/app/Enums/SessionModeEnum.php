<?php

namespace App\Enums;

class SessionModeEnum
{
    const Présentiel = 'Présentiel';
    const Hybride = 'Hybride';
    const Distanciel = 'Distanciel';

    public static function all()
    {
        return [
            self::Présentiel,
            self::Hybride,
            self::Distanciel,
        ];
    }

    public static function isValid($value)
    {
        return in_array($value, self::all());
    }
}