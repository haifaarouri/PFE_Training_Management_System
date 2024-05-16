<?php

namespace App\Enums;

class SessionStatusEnum
{ 
    const EnCours = 'EnCours';
    const Planifiée = 'Planifiée';
    const Terminée = 'Terminée';
    const Annulée = 'Annulée';
    const Reportée = 'Reportée';
    const EnPause = 'EnPause';
    const Complète = 'Complète';
    const Ouverte = 'Ouverte';
    const Fermée = 'Fermée';

    public static function all()
    {
        return [
            self::EnCours,
            self::Planifiée,
            self::Terminée,
            self::Annulée,
            self::Reportée,
            self::EnPause,
            self::Complète,
            self::Ouverte,
            self::Fermée,
        ];
    }

    public static function isValid($value)
    {
        return in_array($value, self::all());
    }
}