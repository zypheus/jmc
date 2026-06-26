<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryProgram extends Model
{
    protected $table = 'library_programs';

    use HasFactory;

    protected $fillable = ['program_code', 'program_name', 'total_years'];

    public function courses(): HasMany
    {
        return $this->hasMany(LibraryProgramCourse::class, 'program_id');
    }

    protected static function boot(): void
    {
        parent::boot();

        static::deleting(function (self $program): void {
            $program->courses()->delete();
        });
    }

    public function books()
    {
        return $this->belongsToMany(LibraryBook::class, 'library_book_program', 'program_id', 'book_id');
    }
}
