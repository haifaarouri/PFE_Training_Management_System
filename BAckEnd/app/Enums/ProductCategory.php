<?php

namespace App\Enums;

class ProductCategory
{
    const Alimentaire = 'Alimentaire';
    const Pharmaceutique = 'Pharmaceutique';
    const TicketRestaurant = 'TicketRestaurant';

    public static function all()
    {
        return [
            self::Alimentaire,
            self::Pharmaceutique,
            self::TicketRestaurant
        ];
    }

    public static function isValid($value)
    {
        return in_array($value, self::all());
    }
}