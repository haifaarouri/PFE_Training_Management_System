<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JourSession extends Model
{
    use HasFactory;
    protected $fillable = [
        "day",
        "startTime",
        "endTime",
        "session_id",
        "salle_id"
    ];

    public function session()
    {
        return $this->belongsTo(Session::class, 'session_id', 'id');
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class, 'salle_id', 'id');
    }

    public function formateur()
    {
        return $this->belongsTo(Formateur::class, 'formateur_id', 'id');
    }

    public function participants()
    {
        return $this->belongsToMany(Participant::class, 'participant_jour_session')
            ->withPivot('presenceStatus', 'session_id')
            ->withTimestamps();
    }

    public function updateParticipantPresenceStatus($participantId, $presenceStatus)
    {
        \Log::info("Attempting to update presence status for participant ID: {$participantId} in JourSession ID: {$this->id} to {$presenceStatus}");

        // First, ensure the participant is actually related to this JourSession
        $participant = $this->participants()->where('participant_id', $participantId)->first();

        if (!$participant) {
            \Log::warning("Participant ID: {$participantId} not found in JourSession ID: {$this->id}");
            return false;
        }

        // Perform the update on the pivot table
        $updatedCount = $this->participants()->updateExistingPivot($participantId, [
            'presenceStatus' => $presenceStatus
        ]);

        \Log::info("Updated count: {$updatedCount}");

        if ($updatedCount > 0) {
            \Log::info("Presence status updated successfully for participant ID: {$participantId}");
            return true;
        } else {
            \Log::warning("Failed to update presence status for participant ID: {$participantId}");
            return false; // No records were updated, handle accordingly
        }
    }
}
