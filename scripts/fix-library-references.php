<?php

/**
 * Fix residual USM namespace references in ported library files.
 * Run: php scripts/fix-library-references.php
 */
$root = dirname(__DIR__);

$replacements = [
    '\\App\\Models\\ReservationStudent' => '\\App\\Domain\\Library\\Models\\LibraryReservationStudent',
    '\\App\\Models\\ReservationLog' => '\\App\\Domain\\Library\\Models\\LibraryReservationLog',
    'use App\\Models\\ReservationStudent;' => 'use App\\Domain\\Library\\Models\\LibraryReservationStudent;',
    'use App\\Models\\ReservationLog;' => 'use App\\Domain\\Library\\Models\\LibraryReservationLog;',
    'ReservationStudent::' => 'LibraryReservationStudent::',
    'ReservationLog::' => 'LibraryReservationLog::',
    '\\App\\Models\\LibraryBook' => '\\App\\Domain\\Library\\Models\\LibraryBook',
    '\\App\\Models\\LibraryHoliday' => '\\App\\Domain\\Library\\Models\\LibraryHoliday',
    '\\App\\Models\\AdminActivity' => '\\App\\Domain\\Library\\Models\\AdminActivity',
    '\\App\\Services\\AdminActivityLogger' => '\\App\\Domain\\Library\\Services\\AdminActivityLogger',
    'exists:rooms,id' => 'exists:library_rooms,id',
    'exists:books,id' => 'exists:library_books,id',
    'exists:students,id' => 'exists:library_students,id',
    'exists:employees,id' => 'exists:library_employees,id',
    'unique:programs,program_code' => 'unique:library_programs,program_code',
    'unique:students,' => 'unique:library_students,',
    'compact(\'library_rooms\')' => "compact('rooms')",
    "'library_students'" => "'students'",
    '->library_students' => '->students',
];

$dirs = [
    $root.'/app/Domain/Library',
    $root.'/app/Http/Controllers/Library',
];

foreach ($dirs as $dir) {
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    foreach ($iterator as $file) {
        if ($file->getExtension() !== 'php') {
            continue;
        }
        $path = $file->getPathname();
        $content = file_get_contents($path);
        $original = $content;
        foreach ($replacements as $search => $replace) {
            $content = str_replace($search, $replace, $content);
        }
        if ($content !== $original) {
            file_put_contents($path, $content);
            echo 'Fixed: '.str_replace($root.'\\', '', $path)."\n";
        }
    }
}

echo "Done.\n";
