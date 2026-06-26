<?php

namespace App\Domain\Attendance\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceStudent extends Model
{
    protected $table = 'attendance_students';

    protected $fillable = [
        'user_id',
        'student_id',
        'firstname',
        'lastname',
        'normalized_name',
        'middle_initial',
        'birth_date',
        'blood_type',
        'qrcode',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class, 'student_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(AttendanceFeedback::class, 'student_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->firstname.' '.$this->lastname);
    }

    public function getProfilePicturePathAttribute(): ?string
    {
        return $this->profile_picture;
    }
}
