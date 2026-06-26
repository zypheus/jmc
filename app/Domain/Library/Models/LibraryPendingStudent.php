<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LibraryPendingStudent extends Model
{
    use HasFactory;

    protected $table = 'library_pending_students';

    protected $fillable = [
        'id_number',
        'lastname',
        'firstname',
        'middle_initial',
        'birthday',
        'qrcode',
        'course',
        'year',
        'mobile_number',
        'email',
        'address',
        'emergency_person',
        'emergency_relationship',
        'emergency_number',
        'emergency_address',
        'profile_picture',
        'student_signature',
    ];

    public function role()
    {
        return $this->belongsTo(LibraryRole::class);
    }
}
