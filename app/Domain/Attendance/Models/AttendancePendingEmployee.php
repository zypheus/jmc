<?php

namespace App\Domain\Attendance\Models;

use Illuminate\Database\Eloquent\Model;

class AttendancePendingEmployee extends Model
{
    protected $table = 'attendance_pending_employees';

    protected $fillable = [
        'firstname',
        'lastname',
        'department',
        'position',
        'employee_id',
        'employee_number',
        'birth_date',
        'sex',
        'civil_status',
        'blood_type',
        'tin_id_number',
        'philhealth_number',
        'sss_number',
        'hdmf_number',
        'qrcode',
        'formal_picture',
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_number',
        'address',
        'employee_signature',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }
}
