<?php

$root = dirname(__DIR__);

$routePrefixes = [
    'account.', 'admin.', 'book.', 'books.', 'catalog.', 'checkout.', 'circulation.',
    'employees.', 'export.', 'feedback.', 'fines.', 'holidays.', 'idcard.', 'landing.',
    'logs.', 'opac.', 'patron.', 'pending.', 'prospectus.', 'reports.', 'resrooms.',
    'rooms.', 'sms.', 'students.', 'transactions.', 'program.',
];

$dirs = [$root.'/app/Domain/Library', $root.'/app/Http/Controllers/Library'];

foreach ($dirs as $dir) {
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    foreach ($iterator as $file) {
        if ($file->getExtension() !== 'php') {
            continue;
        }
        $path = $file->getPathname();
        $content = file_get_contents($path);
        $original = $content;

        $content = str_replace('LibraryLibraryReservationStudent', 'LibraryReservationStudent', $content);
        $content = str_replace('LibraryLibraryReservationLog', 'LibraryReservationLog', $content);

        foreach ($routePrefixes as $prefix) {
            $content = preg_replace(
                "/route\\('{$prefix}/",
                "route('library.{$prefix}",
                $content
            );
        }

        $content = str_replace("route('library.patron.register')", "route('library.register.form')", $content);

        if ($content !== $original) {
            file_put_contents($path, $content);
            echo str_replace($root.'/', '', $path)."\n";
        }
    }
}

echo "Done.\n";
