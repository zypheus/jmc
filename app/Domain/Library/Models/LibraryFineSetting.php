<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryFineSetting extends Model
{
    protected $table = 'library_fine_settings';

    public const DEFAULT_LOAN_DURATION_DAYS = 7;

    protected $fillable = [
        'fine_per_day',
        'max_fine',
        'grace_period_days',
        'loan_duration_days',
        'student_fine_per_day',
        'student_max_fine',
        'student_grace_period_days',
        'student_loan_duration_days',
        'employee_fine_per_day',
        'employee_max_fine',
        'employee_grace_period_days',
        'employee_loan_duration_days',
        'effective_from',
    ];

    public static function current(): ?self
    {
        return self::orderByDesc('effective_from')->first();
    }

    /**
     * @return object{fine_per_day: float, max_fine: ?float, grace_period_days: int, loan_duration_days: int}
     */
    public function patronTerms(bool $isEmployee): object
    {
        if ($isEmployee) {
            return (object) [
                'fine_per_day' => (float) ($this->employee_fine_per_day ?? $this->fine_per_day ?? 0),
                'max_fine' => $this->employee_max_fine ?? $this->max_fine,
                'grace_period_days' => (int) ($this->employee_grace_period_days ?? $this->grace_period_days ?? 0),
                'loan_duration_days' => (int) ($this->employee_loan_duration_days ?? $this->loan_duration_days ?? self::DEFAULT_LOAN_DURATION_DAYS),
            ];
        }

        return (object) [
            'fine_per_day' => (float) ($this->student_fine_per_day ?? $this->fine_per_day ?? 0),
            'max_fine' => $this->student_max_fine ?? $this->max_fine,
            'grace_period_days' => (int) ($this->student_grace_period_days ?? $this->grace_period_days ?? 0),
            'loan_duration_days' => (int) ($this->student_loan_duration_days ?? $this->loan_duration_days ?? self::DEFAULT_LOAN_DURATION_DAYS),
        ];
    }

    public function studentLoanDurationDays(): int
    {
        return $this->patronTerms(false)->loan_duration_days;
    }

    public function employeeLoanDurationDays(): int
    {
        return $this->patronTerms(true)->loan_duration_days;
    }
}
