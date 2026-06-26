<?php

namespace App\Domain\Attendance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceProgramCourse extends Model
{
    protected $table = 'attendance_program_courses';

    protected $fillable = [
        'program_year_id',
        'course_code',
        'course_name',
    ];

    public function programYear(): BelongsTo
    {
        return $this->belongsTo(AttendanceProgramYear::class, 'program_year_id');
    }
}
