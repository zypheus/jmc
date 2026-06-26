<?php

namespace Database\Seeders;

use App\Domain\Library\Models\LibraryFineSetting;
use App\Domain\Library\Models\LibrarySetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class LibraryFineAndSettingsSeeder extends Seeder
{
    public function run(): void
    {
        LibraryFineSetting::query()->updateOrCreate(
            ['effective_from' => Carbon::today()->toDateString()],
            [
                'fine_per_day' => 5.00,
                'max_fine' => 500.00,
                'grace_period_days' => 0,
                'loan_duration_days' => 7,
                'student_fine_per_day' => 5.00,
                'student_max_fine' => 500.00,
                'student_grace_period_days' => 0,
                'student_loan_duration_days' => 7,
                'employee_fine_per_day' => 5.00,
                'employee_max_fine' => 500.00,
                'employee_grace_period_days' => 0,
                'employee_loan_duration_days' => 14,
            ]
        );

        LibrarySetting::setBorrowLimits(5, false, 10);
        LibrarySetting::setLoanPolicies(3, 7);
        LibrarySetting::setReservationHoldDays(3);
    }
}
