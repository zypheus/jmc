<?php

namespace App\Domain\Library\Support;

use App\Domain\Library\Models\LibraryFineSetting;
use App\Domain\Library\Models\LibraryHoliday;
use Carbon\Carbon;

class LoanDueDate
{
    public static function addBusinessDays(Carbon $start, int $days): Carbon
    {
        $holidays = LibraryHoliday::pluck('holiday_date')->map(function ($d) {
            return Carbon::parse($d)->startOfDay()->toDateString();
        });

        $date = $start->copy()->startOfDay();
        $added = 0;

        while ($added < $days) {
            $date->addDay();

            if (! $date->isWeekend() && ! $holidays->contains($date->toDateString())) {
                $added++;
            }
        }

        return $date;
    }

    /**
     * @return array{due_date: ?Carbon, loan_duration_days: ?int}
     */
    public static function resolveFromRequest(
        Carbon $borrowedAt,
        ?LibraryFineSetting $settings,
        ?string $dueDateInput,
        ?int $loanDaysInput,
        bool $isEmployee = false,
    ): array {
        if ($dueDateInput) {
            return [
                'due_date' => Carbon::parse($dueDateInput)->startOfDay(),
                'loan_duration_days' => null,
            ];
        }

        if ($loanDaysInput !== null && $loanDaysInput > 0) {
            return [
                'due_date' => self::addBusinessDays($borrowedAt, $loanDaysInput),
                'loan_duration_days' => $loanDaysInput,
            ];
        }

        $defaultDays = $settings
            ? $settings->patronTerms($isEmployee)->loan_duration_days
            : LibraryFineSetting::DEFAULT_LOAN_DURATION_DAYS;

        return [
            'due_date' => self::addBusinessDays($borrowedAt, $defaultDays),
            'loan_duration_days' => $defaultDays,
        ];
    }
}
