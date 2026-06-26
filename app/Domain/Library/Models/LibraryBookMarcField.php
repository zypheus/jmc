<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryBookMarcField extends Model
{
    protected $table = 'library_book_marc_fields';

    protected $fillable = [
        'book_id',
        'tag',
        'subfield',
        'indicator1',
        'indicator2',
        'occurrence',
        'value',
    ];
}
