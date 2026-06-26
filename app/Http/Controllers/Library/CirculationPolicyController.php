<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryFineSetting;
use App\Domain\Library\Models\LibrarySetting;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CirculationPolicyController extends Controller
{
    public function edit()
    {
        $fineSettings = LibraryFineSetting::latest('created_at')->first();
        $termsBase = $fineSettings ?? new LibraryFineSetting;
        $studentTerms = $termsBase->patronTerms(false);
        $employeeTerms = $termsBase->patronTerms(true);

        return Inertia::render('Library/Policy/Edit', [
            'studentMax' => LibrarySetting::maxLoansForStudents(),
            'employeeUnlimited' => LibrarySetting::employeeLoansUnlimited(),
            'employeeMax' => LibrarySetting::maxLoansForEmployees(),
            'maxRenewals' => LibrarySetting::maxRenewalsPerLoan(),
            'reborrowCooldownDays' => LibrarySetting::reborrowCooldownDays(),
            'reservationHoldDays' => LibrarySetting::reservationHoldDays(),
            'studentTerms' => $studentTerms,
            'employeeTerms' => $employeeTerms,
        ]);
    }

    public function update(Request $request)
    {
        $employeeUnlimited = $request->input('employee_unlimited') === '1';

        $request->validate([
            'student_max' => 'required|integer|min:1|max:100',
            'employee_unlimited' => 'required|in:0,1',
            'employee_max' => $employeeUnlimited ? 'nullable|integer|min:1|max:100' : 'required|integer|min:1|max:100',
            'max_renewals' => 'required|integer|min:0|max:50',
            'reborrow_cooldown_days' => 'required|integer|min:0|max:365',
            'reservation_hold_days' => 'required|integer|min:1|max:365',
            'student_fine_per_day' => 'required|numeric|min:0',
            'student_max_fine' => 'nullable|numeric|min:0',
            'student_grace_period_days' => 'required|integer|min:0',
            'student_loan_duration_days' => 'required|integer|min:1|max:365',
            'employee_fine_per_day' => 'required|numeric|min:0',
            'employee_max_fine' => 'nullable|numeric|min:0',
            'employee_grace_period_days' => 'required|integer|min:0',
            'employee_loan_duration_days' => 'required|integer|min:1|max:365',
        ]);

        LibrarySetting::setBorrowLimits(
            (int) $request->input('student_max'),
            $employeeUnlimited,
            (int) ($request->input('employee_max') ?: LibrarySetting::DEFAULT_MAX_LOANS_EMPLOYEES)
        );

        LibrarySetting::setLoanPolicies(
            (int) $request->input('max_renewals'),
            (int) $request->input('reborrow_cooldown_days')
        );

        LibrarySetting::setReservationHoldDays((int) $request->input('reservation_hold_days'));

        LibraryFineSetting::create([
            'fine_per_day' => $request->student_fine_per_day,
            'max_fine' => $request->student_max_fine,
            'grace_period_days' => $request->student_grace_period_days,
            'loan_duration_days' => $request->student_loan_duration_days,
            'student_fine_per_day' => $request->student_fine_per_day,
            'student_max_fine' => $request->student_max_fine,
            'student_grace_period_days' => $request->student_grace_period_days,
            'student_loan_duration_days' => $request->student_loan_duration_days,
            'employee_fine_per_day' => $request->employee_fine_per_day,
            'employee_max_fine' => $request->employee_max_fine,
            'employee_grace_period_days' => $request->employee_grace_period_days,
            'employee_loan_duration_days' => $request->employee_loan_duration_days,
            'effective_from' => now(),
        ]);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_SETTINGS,
            'Circulation policy updated',
            'Borrow limits, renewals, and fine settings changed',
            route('library.circulation.policy.edit'),
            'circulation',
        );

        return redirect()
            ->route('library.circulation.policy.edit', [], 303)
            ->with('success', 'Circulation policy updated successfully.')
            ->withFragment('fines-pane');
    }
}
