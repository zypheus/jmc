<?php

namespace App\Domain\Attendance\Support;

class PatronNameNormalizer
{
    public static function normalizeFullName(string $fullName): string
    {
        $full = strtoupper($fullName);
        $full = preg_replace('/[^A-Z\s]/', '', $full);
        $full = preg_replace('/\b[A-Z]\b/', '', $full);

        return preg_replace('/\s+/', '', $full);
    }
}
