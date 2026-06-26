<?php

namespace App\Domain\Library\Support;

use Illuminate\Http\Request;

class PerPage
{
    public const OPTIONS = [10, 25, 50, 100, 250, 500];

    public const DEFAULT = 25;

    public static function resolve(Request $request, int $default = self::DEFAULT): int
    {
        $perPage = (int) $request->input('per_page', $default);

        return in_array($perPage, self::OPTIONS, true) ? $perPage : $default;
    }

    /**
     * @return array<int, int>
     */
    public static function options(): array
    {
        return self::OPTIONS;
    }
}
