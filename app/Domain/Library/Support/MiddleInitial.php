<?php

namespace App\Domain\Library\Support;

use Illuminate\Http\Request;

class MiddleInitial
{
    /**
     * One letter only — strips periods and other non-letters (avoids "P.." in display).
     */
    public static function normalize(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $letters = preg_replace('/[^A-Za-z]/', '', (string) $value);
        if ($letters === '') {
            return null;
        }

        return mb_strtoupper(mb_substr($letters, 0, 1));
    }

    public static function mergeIntoRequest(Request $request, string $key = 'middle_initial'): void
    {
        $request->merge([
            $key => self::normalize($request->input($key)),
        ]);
    }

    public static function validationRule(): string
    {
        return 'nullable|string|size:1|alpha';
    }
}
