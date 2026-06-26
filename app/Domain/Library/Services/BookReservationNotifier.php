<?php

namespace App\Domain\Library\Services;

use App\Domain\Library\Mail\BookReservationReadyMail;
use App\Domain\Library\Models\LibraryBookReservation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookReservationNotifier
{
    public function notifyIfReady(LibraryBookReservation $reservation): void
    {
        $reservation->refresh();

        if ($reservation->status !== LibraryBookReservation::STATUS_READY) {
            return;
        }

        if ($reservation->ready_notified_at !== null) {
            return;
        }

        $reservation->loadMissing(['student', 'book']);
        $email = $reservation->student?->email;

        if (! filled($email)) {
            return;
        }

        try {
            Mail::to($email)->send(new BookReservationReadyMail($reservation));

            $reservation->update([
                'ready_notified_at' => now('Asia/Manila'),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Book reservation ready email failed', [
                'reservation_id' => $reservation->id,
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
