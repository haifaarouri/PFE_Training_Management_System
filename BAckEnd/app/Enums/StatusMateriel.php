<?php

namespace App\Enums;

class StatusMateriel
{
    const Neuf = 'Neuf';
    const Fonctionnel = 'Fonctionnel';
    const Réparé = 'Réparé';
    const HorsService = 'HorsService';
    const EnMaintenance = 'EnMaintenance';
    const EnAttenteDeRéparation = 'EnAttenteDeRéparation';
    const Suffisant = 'Suffisant';
    const À_Réapprovisionner = 'À_Réapprovisionner';

    public static function all()
    {
        return [
            self::Neuf,
            self::Fonctionnel,
            self::Réparé,
            self::EnMaintenance,
            self::EnAttenteDeRéparation,
            self::HorsService,
            self::Suffisant,
            self::À_Réapprovisionner,
        ];
    }

    public static function isValid($value)
    {
        return in_array($value, self::all());
    }
}