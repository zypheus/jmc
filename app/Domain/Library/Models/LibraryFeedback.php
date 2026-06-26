<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryFeedback extends Model
{
    protected $table = 'library_feedback';

    protected $fillable = ['name', 'email', 'comments'];
}
