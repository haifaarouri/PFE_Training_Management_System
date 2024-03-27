<?php

namespace App\Enums;

class StateEnum
{
    const USED = 'USED';
    const CANCELED = 'CANCELED';

    public static function all()
    {
        return [
            self::USED,
            self::CANCELED
        ];
    }

    public static function isValid($value)
    {
        return in_array($value, self::all());
    }
}