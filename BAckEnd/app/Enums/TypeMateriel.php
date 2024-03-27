<?php

namespace App\Enums;

class TypeMateriel
{
    const MatérielInformatique = 'MatérielInformatique';
    const MatérielAudioVidéo = 'MatérielAudioVidéo';
    const Chaise = 'Chaise';
    const Écran = 'Écran';
    const Imprimante = 'Imprimante';
    const Table = 'Table';
    const Projecteur = 'Projecteur';
    const Scanner = 'Scanner';
    const MatérielRéseautage = 'MatérielRéseautage';
    const Accessoires = 'Accessoires';
    const Papier = 'Papier';
    const Stylo = 'Stylo';
    const BlocNotes = 'BlocNotes';

    public static function all()
    {
        return [
            self::MatérielInformatique,
            self::MatérielAudioVidéo,
            self::Chaise,
            self::Scanner,
            self::Table,
            self::Projecteur,
            self::Écran,
            self::Imprimante,
            self::MatérielRéseautage,
            self::Accessoires,
            self::Papier,
            self::Stylo,
            self::BlocNotes,
        ];
    }

    public static function isValid($value)
    {
        return in_array($value, self::all());
    }
}