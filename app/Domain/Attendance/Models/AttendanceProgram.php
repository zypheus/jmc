<?php

namespace App\Domain\Attendance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceProgram extends Model
{
    protected $table = 'attendance_programs';

    protected $fillable = [
        'program_code',
        'program_name',
        'total_years',
    ];

    public function years(): HasMany
    {
        return $this->hasMany(AttendanceProgramYear::class, 'program_id');
    }
}
