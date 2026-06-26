<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LibraryStudent extends Model
{
    protected $table = 'library_students';

    use HasFactory;

    protected $fillable = [
        'id_number',
        'lastname',
        'firstname',
        'middle_initial',
        'birthday',
        'qrcode',
        'course',
        'year',
        'profile_picture',
        'student_signature',
        'mobile_number',
        'address',
        'emergency_person',
        'emergency_relationship',
        'emergency_number',
        'emergency_address',
    ];

    public function editRequests()
    {
        return $this->hasMany(LibraryStudentEditRequest::class);
    }

    public function bookLogs()
    {
        return $this->hasMany(LibraryBookLog::class, 'student_id');
    }

    public function bookReservations()
    {
        return $this->hasMany(LibraryBookReservation::class);
    }
}
