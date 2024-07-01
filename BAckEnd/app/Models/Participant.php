<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Participant extends Model
{
    use HasFactory;

    protected $fillable = [
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'address',
        'type',
        'companyName'
    ];

    public function sessions()
    {
        return $this->belongsToMany(Session::class, 'participant_session')
            ->withPivot('participationStatus', 'participant_id', 'session_id', 'waitlist_order', 'created_at', 'updated_at')
            ->withTimestamps();
    }

    public function jourSessions()
    {
        return $this->belongsToMany(JourSession::class, 'participant_jour_session')
            ->withPivot('presenceStatus', 'session_id')
            ->withTimestamps();
    }

    /**
     * Update the participation status of the next waitlisted participant to 'Confirmed'
     * when a confirmed participant cancels their participation.
     */
    public static function updateWaitingList($sessionId)
    {
        DB::transaction(function () use ($sessionId) {
            // Find the first waitlisted participant
            $nextConfirmed = Participant::whereHas('sessions', function ($query) use ($sessionId) {
                $query->where('session_id', $sessionId)
                    ->where('participationStatus', 'Waitlisted')
                    ->orderBy('waitlist_order');
            })->first();

            // Confirm the next participant
            if ($nextConfirmed) {
                $nextConfirmed->sessions()->updateExistingPivot($sessionId, [
                    'participationStatus' => 'Confirmed',
                    'waitlist_order' => null
                ]);

                // Decrement waitlist_order for remaining waitlisted participants
                $participantsToUpdate = Participant::whereHas('sessions', function ($query) use ($sessionId) {
                    $query->where('session_id', $sessionId)
                        ->where('participationStatus', 'Waitlisted');
                })->get();

                foreach ($participantsToUpdate as $participant) {
                    $currentOrder = $participant->sessions()->first()->pivot->waitlist_order;
                    if ($currentOrder > 1) {
                        $participant->sessions()->updateExistingPivot($sessionId, [
                            'waitlist_order' => $currentOrder - 1
                        ]);
                    }
                }
            }
        });
    }
}
