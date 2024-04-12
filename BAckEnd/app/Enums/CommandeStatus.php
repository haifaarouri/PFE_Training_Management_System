<?php

namespace App\Enums;

class CommandeStatus
{
    const Brouillon = 'Brouillon';
    const EnCours = 'EnCours';
    const Confirmé = 'Confirmé';
    const Annulé = 'Annulé';
    const Réceptionné = 'Réceptionné';
    const Consommé = 'Consommé';

    public static function all()
    {
        return [
            self::Brouillon,
            self::EnCours,
            self::Confirmé,
            self::Annulé,
            self::Réceptionné,
            self::Consommé
        ];
    }

    public static function isValid($value)
    {
        return in_array($value, self::all());
    }
}