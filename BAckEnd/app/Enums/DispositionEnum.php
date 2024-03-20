<?php

namespace App\Enums;

class DispositionEnum
{
    const U = 'U';
    const CLASSROOM = 'CLASSROOM';
    const THEATRE = 'THEATRE';
    const TABLE = 'TABLE';

    public static function all()
    {
        return [
            self::U,
            self::CLASSROOM,
            self::THEATRE,
            self::TABLE,
        ];
    }

    public static function isValid($value)
    {
        return in_array($value, self::all());
    }
}