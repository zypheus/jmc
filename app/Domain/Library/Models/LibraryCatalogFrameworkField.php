<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryCatalogFrameworkField extends Model
{
    protected $table = 'library_catalog_framework_fields';

    protected $fillable = [
        'framework_id',
        'marc_field_id',
        'visible',
        'required',
        'sort_order',
        'book_column',
        'default_value',
    ];

    protected $casts = [
        'visible' => 'boolean',
        'required' => 'boolean',
    ];

    public function framework()
    {
        return $this->belongsTo(LibraryCatalogFramework::class, 'framework_id');
    }

    public function marcField()
    {
        return $this->belongsTo(LibraryMarcField::class, 'marc_field_id');
    }
}
