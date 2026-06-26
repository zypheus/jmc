<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryRole extends Model
{
    protected $table = 'library_roles';

    protected $fillable = ['description'];
}
