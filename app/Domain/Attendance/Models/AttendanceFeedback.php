<?php

namespace App\Domain\Attendance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceFeedback extends Model
{
    protected $table = 'attendance_feedback';

    protected $fillable = [
        'student_id',
        'rating',
        'declined',
    ];

    protected function casts(): array
    {
        return [
            'declined' => 'boolean',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(AttendanceStudent::class, 'student_id');
    }
}
