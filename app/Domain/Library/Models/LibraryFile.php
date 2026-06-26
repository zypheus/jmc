<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LibraryFile extends Model
{
    protected $table = 'library_files';

    protected $fillable = [
        'folder',
        'filename',
        'filepath',
    ];

    public function publicDiskPath(): string
    {
        $p = (string) $this->filepath;
        if (str_starts_with($p, 'public/')) {
            return substr($p, strlen('public/'));
        }

        return $p;
    }

    public function absolutePath(): string
    {
        return storage_path('app/public/'.$this->publicDiskPath());
    }

    public function folderLabel(): string
    {
        $key = $this->folder ?: 'general';
        $labels = config('repository.folder_presets', []);

        return $labels[$key]
            ?? Str::headline(str_replace(['-', '_'], ' ', $key));
    }
}
