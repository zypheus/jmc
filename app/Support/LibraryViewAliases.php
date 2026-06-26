<?php

namespace App\Support;

class LibraryViewAliases
{
    /**
     * Blade views copied from USM expect $programs, $books, $ebooks.
     * Controllers often pass library_* prefixed keys.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function apply(array $data): array
    {
        if (array_key_exists('library_programs', $data) && ! array_key_exists('programs', $data)) {
            $data['programs'] = $data['library_programs'];
        }

        if (array_key_exists('library_books', $data) && ! array_key_exists('books', $data)) {
            $data['books'] = $data['library_books'];
        }

        if (array_key_exists('library_ebooks', $data) && ! array_key_exists('ebooks', $data)) {
            $data['ebooks'] = $data['library_ebooks'];
        }

        if (isset($data['viewMode'])) {
            $data['viewMode'] = match ($data['viewMode']) {
                'library_books' => 'books',
                'library_ebooks' => 'ebooks',
                default => $data['viewMode'],
            };
        }

        return $data;
    }
}
