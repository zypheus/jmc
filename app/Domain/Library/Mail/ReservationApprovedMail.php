<?php

namespace App\Domain\Library\Mail;

use App\Domain\Library\Models\LibraryRoomReservation;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public RoomReservation $reservation;

    public function __construct(LibraryRoomReservation $reservation)
    {
        $this->reservation = $reservation->loadMissing(['room', 'students', 'approver']);
    }

    public function build()
    {
        $room = $this->reservation->room?->name ?? 'Room';
        $date = Carbon::parse($this->reservation->date)->format('M j, Y');

        return $this->subject("Room reservation approved — {$room}, {$date}")
            ->view('emails.reservations.approved');
    }
}
