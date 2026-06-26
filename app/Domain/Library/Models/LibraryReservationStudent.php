<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryReservationStudent extends Model
{
    protected $table = 'library_reservation_students';

    protected $fillable = [
        'reservation_id',
        'name',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(LibraryRoomReservation::class, 'reservation_id');
    }
}
