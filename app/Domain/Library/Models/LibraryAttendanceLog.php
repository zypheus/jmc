<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryAttendanceLog extends Model
{
    protected $table = 'library_attendance_logs';

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
        return $this->belongsTo(LibraryStudent::class, 'student_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(LibraryEmployee::class, 'employee_id');
    }

    public function patron(): LibraryStudent|LibraryEmployee|null
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
