<?php

namespace App\Domain\Library\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryRoomReservation extends Model
{
    protected $table = 'library_room_reservations';

    use HasFactory;

    protected $fillable = [
        'room_id',
        'status',
        'date',
        'start_time',
        'end_time',
        'patron_email',
        'number_of_students',
        'notes',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'approved_at' => 'datetime',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(LibraryRoom::class, 'room_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(LibraryReservationStudent::class, 'reservation_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(LibraryReservationLog::class, 'reservation_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
