<?php

namespace App\Domain\Library\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryReservationLog extends Model
{
    protected $table = 'library_reservation_logs';

    protected $fillable = [
        'reservation_id',
        'user_id',
        'action',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(LibraryRoomReservation::class, 'reservation_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
