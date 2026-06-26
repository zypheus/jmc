<?php

namespace App\Domain\Attendance\Models;

use Illuminate\Database\Eloquent\Model;

class AttendancePendingStudent extends Model
{
    protected $table = 'attendance_pending_students';

    protected $fillable = [
        'student_id',
        'firstname',
        'lastname',
        'middle_initial',
        'birth_date',
        'blood_type',
        'course',
        'year',
        'mobile_number',
        'profile_picture',
        'emergency_person',
        'emergency_relationship',
        'emergency_number',
        'emergency_address',
        'student_signature',
        'address',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }
}
