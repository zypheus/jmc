<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryEbook extends Model
{
    protected $table = 'library_ebooks';

    //
    protected $fillable = [
        'title',
        'author',
        'publication_year',
        'publisher',
        'source',
        'link',
        'program_id',
        'course_id',
    ];

    public function program()
    {
        return $this->belongsTo(LibraryProgram::class, 'program_id');
    }

    public function course()
    {
        return $this->belongsTo(LibraryProgramCourse::class, 'course_id');
    }
}
