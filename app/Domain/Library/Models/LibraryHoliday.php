<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryHoliday extends Model
{
    protected $table = 'library_holidays';

    protected $fillable = ['holiday_date', 'name'];
}
