<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryProspectus extends Model
{
    protected $table = 'library_prospectuses';

    protected $fillable = ['course', 'year', 'subject'];
}
