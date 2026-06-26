<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryCatalogFramework extends Model
{
    protected $table = 'library_catalog_frameworks';

    protected $fillable = [
        'name',
    ];

    public function fields()
    {
        return $this->hasMany(LibraryCatalogFrameworkField::class, 'framework_id');
    }
}
