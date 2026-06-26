<?php

namespace App\Domain\Attendance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceLog extends Model
{
    protected $table = 'attendance_logs';

    protected $fillable = [
        'student_id',
        'employee_id',
        'status',
        'section',
        'scanned_at',
    ];

    protected function casts(): array
    {
        return [
            'scanned_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(AttendanceStudent::class, 'student_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(AttendanceEmployee::class, 'employee_id');
    }

    public function patron(): AttendanceStudent|AttendanceEmployee|null
    {
        return $this->student ?? $this->employee;
    }

    public function patronType(): ?string
    {
        if ($this->student_id) {
            return 'student';
        }

        if ($this->employee_id) {
            return 'employee';
        }

        return null;
    }
}
