<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryProgramCourse extends Model
{
    protected $table = 'library_program_courses';

    protected $fillable = [
        'program_id',
        'year_level',
        'course_code',
        'course_name',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(LibraryProgram::class, 'program_id');
    }

    public function ebooks(): HasMany
    {
        return $this->hasMany(LibraryEbook::class, 'course_id');
    }
}
