<?php

namespace App\Domain\Attendance\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceEmployee extends Model
{
    protected $table = 'attendance_employees';

    protected $fillable = [
        'user_id',
        'employee_id',
        'employee_number',
        'firstname',
        'lastname',
        'department',
        'position',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class, 'employee_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->firstname.' '.$this->lastname);
    }

    public function getProfilePicturePathAttribute(): ?string
    {
        return $this->formal_picture;
    }
}
