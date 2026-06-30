<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryAttendanceFeedback extends Model
{
    protected $table = 'library_attendance_feedbacks';

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
        return $this->belongsTo(LibraryStudent::class, 'student_id');
    }
}
