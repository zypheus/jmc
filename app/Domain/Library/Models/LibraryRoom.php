<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LibraryRoom extends Model
{
    protected $table = 'library_rooms';

    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'capacity',
    ];

    public function reservations()
    {
        return $this->hasMany(LibraryRoomReservation::class);
    }
}
