<?php

namespace App\Domain\Library\Services;

use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryBookReservation;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryProgram;
use App\Domain\Library\Models\LibrarySetting;
use App\Domain\Library\Models\LibraryStudent;
use Illuminate\Database\Eloquent\Builder;

class LibraryPatronProfileService
{
    /**
     * @return array<string, mixed>
     */
    public function forStudent(LibraryStudent $student): array
    {
        session(['student_id' => $student->id]);

        $program = LibraryProgram::where('program_code', $student->course)->first();
        $programs = LibraryProgram::orderBy('program_name')->get();

        LibraryBookReservation::expireStale();

        $bookReservations = LibraryBookReservation::query()
            ->with('book')
            ->where('student_id', $student->id)
            ->whereIn('status', [LibraryBookReservation::STATUS_PENDING, LibraryBookReservation::STATUS_READY])
            ->orderByDesc('reserved_at')
            ->get();

        $readyReservations = $bookReservations->where('status', LibraryBookReservation::STATUS_READY)->values();
        $pendingReservations = $bookReservations->where('status', LibraryBookReservation::STATUS_PENDING)->values();

        [$legacyComma, $legacySpace] = $this->legacyNames($student->firstname, $student->lastname);
        $circulation = $this->circulationPayload(
            fn (Builder $q) => $this->applyStudentLogScope($q, $student->id, $legacyComma, $legacySpace)
        );

        return [
            'patronType' => 'student',
            'student' => $this->serializeStudent($student, $program),
            'programs' => $programs->map(fn (LibraryProgram $p) => [
                'id' => $p->id,
                'program_name' => $p->program_name,
                'program_code' => $p->program_code,
            ])->values()->all(),
            'readyReservations' => $readyReservations->map(fn (LibraryBookReservation $r) => $this->serializeReservation($r))->values()->all(),
            'pendingReservations' => $pendingReservations->map(fn (LibraryBookReservation $r) => $this->serializeReservation($r))->values()->all(),
            'hasPendingEditRequest' => $student->editRequests()->where('status', 'pending')->exists(),
            'maxRenewalsPerLoan' => LibrarySetting::maxRenewalsPerLoan(),
            ...$circulation,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function forEmployee(LibraryEmployee $employee): array
    {
        [$legacyComma, $legacySpace] = $this->legacyNames($employee->firstname, $employee->lastname);
        $circulation = $this->circulationPayload(
            fn (Builder $q) => $this->applyEmployeeLogScope($q, $employee->id, $legacyComma, $legacySpace)
        );

        return [
            'patronType' => 'employee',
            'employee' => $this->serializeEmployee($employee),
            'programs' => LibraryProgram::orderBy('program_name')->get()->map(fn (LibraryProgram $p) => [
                'id' => $p->id,
                'program_name' => $p->program_name,
                'program_code' => $p->program_code,
            ])->values()->all(),
            'workStartYears' => range((int) date('Y'), 1980),
            'hasPendingEditRequest' => $employee->editRequests()->where('status', 'pending')->exists(),
            'maxRenewalsPerLoan' => LibrarySetting::maxRenewalsPerLoan(),
            ...$circulation,
        ];
    }

    /**
     * @param  callable(Builder): void  $scope
     * @return array<string, mixed>
     */
    private function circulationPayload(callable $scope): array
    {
        $borrowedBooks = LibraryBookLog::with('book')
            ->where(fn (Builder $q) => $scope($q))
            ->where('status', 'Checked Out')
            ->whereNull('returned_date')
            ->get();

        $booksOutCount = $borrowedBooks->count();
        $overdueBooksCount = $borrowedBooks->filter(fn (LibraryBookLog $log) => (int) $log->days_overdue > 0)->count();
        $totalOutstandingFine = round(
            $borrowedBooks->sum(fn (LibraryBookLog $log) => (float) $log->total_fine),
            2
        );

        $returnedFinesBase = LibraryBookLog::query()
            ->where(fn (Builder $q) => $scope($q))
            ->where('status', 'Checked In')
            ->where('fine_incurred', '>', 0);

        $totalReturnedFinesOutstanding = round(
            (float) (clone $returnedFinesBase)->whereNull('fine_cleared_at')->sum('fine_incurred'),
            2
        );

        $returnedFineHistory = (clone $returnedFinesBase)
            ->with(['book', 'clearedBy'])
            ->orderByDesc('returned_date')
            ->limit(25)
            ->get();

        $bookTransactionHistory = LibraryBookLog::query()
            ->with('book')
            ->where(fn (Builder $q) => $scope($q))
            ->orderByDesc('timestamp')
            ->orderByDesc('id')
            ->limit(75)
            ->get();

        $grandDue = round($totalOutstandingFine + $totalReturnedFinesOutstanding, 2);

        return [
            'borrowedBooks' => $borrowedBooks->map(fn (LibraryBookLog $log) => $this->serializeBorrowedLog($log))->values()->all(),
            'booksOutCount' => $booksOutCount,
            'overdueBooksCount' => $overdueBooksCount,
            'totalOutstandingFine' => $totalOutstandingFine,
            'returnedFineHistory' => $returnedFineHistory->map(fn (LibraryBookLog $log) => $this->serializeReturnedFineLog($log))->values()->all(),
            'totalReturnedFinesOutstanding' => $totalReturnedFinesOutstanding,
            'bookTransactionHistory' => $bookTransactionHistory->map(fn (LibraryBookLog $log) => $this->serializeHistoryLog($log))->values()->all(),
            'grandDue' => $grandDue,
        ];
    }

    private function applyStudentLogScope(Builder $q, int $studentId, string $legacyComma, string $legacySpace): void
    {
        $q->where(function ($query) use ($studentId, $legacyComma, $legacySpace) {
            $query->where('student_id', $studentId)
                ->orWhere(function ($q2) use ($legacyComma, $legacySpace) {
                    $q2->whereNull('student_id')
                        ->where(function ($q3) use ($legacyComma, $legacySpace) {
                            $q3->where('patron_name', $legacyComma)
                                ->orWhere('patron_name', $legacySpace);
                        });
                });
        });
    }

    private function applyEmployeeLogScope(Builder $q, int $employeeId, string $legacyComma, string $legacySpace): void
    {
        $q->where(function ($query) use ($employeeId, $legacyComma, $legacySpace) {
            $query->where('employee_id', $employeeId)
                ->orWhere(function ($q2) use ($legacyComma, $legacySpace) {
                    $q2->whereNull('employee_id')
                        ->where(function ($q3) use ($legacyComma, $legacySpace) {
                            $q3->where('patron_name', $legacyComma)
                                ->orWhere('patron_name', $legacySpace);
                        });
                });
        });
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function legacyNames(string $firstname, string $lastname): array
    {
        return [
            "{$lastname}, {$firstname}",
            trim("{$firstname} {$lastname}"),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeStudent(LibraryStudent $student, ?LibraryProgram $program): array
    {
        return [
            'id' => $student->id,
            'firstname' => $student->firstname,
            'lastname' => $student->lastname,
            'middle_initial' => $student->middle_initial,
            'id_number' => $student->id_number,
            'email' => $student->email,
            'course' => $student->course,
            'year' => $student->year,
            'birthday' => $student->birthday,
            'mobile_number' => $student->mobile_number,
            'address' => $student->address,
            'emergency_person' => $student->emergency_person,
            'emergency_relationship' => $student->emergency_relationship,
            'emergency_number' => $student->emergency_number,
            'emergency_address' => $student->emergency_address,
            'profile_picture' => $student->profile_picture ? asset($student->profile_picture) : null,
            'program_name' => $program?->program_name,
            'program_id' => $program?->id,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeEmployee(LibraryEmployee $employee): array
    {
        return [
            'id' => $employee->id,
            'firstname' => $employee->firstname,
            'lastname' => $employee->lastname,
            'middle_initial' => $employee->middle_initial,
            'employee_id' => $employee->employee_id,
            'employee_number' => $employee->employee_number,
            'designation' => $employee->designation,
            'department' => $employee->department,
            'program' => $employee->program,
            'year_start_work' => $employee->year_start_work,
            'birth_date' => $employee->birth_date?->format('Y-m-d'),
            'mobile_number' => $employee->mobile_number,
            'address' => $employee->address,
            'emergency_contact_name' => $employee->emergency_contact_name,
            'emergency_contact_relationship' => $employee->emergency_contact_relationship,
            'emergency_contact_number' => $employee->emergency_contact_number,
            'emergency_address' => $employee->emergency_address,
            'formal_picture' => $employee->formal_picture ? asset($employee->formal_picture) : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeReservation(LibraryBookReservation $reservation): array
    {
        return [
            'id' => $reservation->id,
            'status' => $reservation->status,
            'reserved_at' => $reservation->reserved_at?->timezone('Asia/Manila')->toIso8601String(),
            'expires_at' => $reservation->expiresAt()->timezone('Asia/Manila')->toIso8601String(),
            'book' => $reservation->book ? [
                'title_statement' => $reservation->book->title_statement,
                'barcode' => $reservation->book->barcode,
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeBorrowedLog(LibraryBookLog $log): array
    {
        return [
            'id' => $log->id,
            'title' => $log->book?->title_statement,
            'circulation_type' => $log->circulation_type ?? LibraryBookLog::CIRCULATION_CHECKOUT,
            'due_date' => $log->due_date?->format('Y-m-d'),
            'renew_count' => (int) ($log->renew_count ?? 0),
            'days_overdue' => (int) $log->days_overdue,
            'total_fine' => (float) $log->total_fine,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeReturnedFineLog(LibraryBookLog $log): array
    {
        return [
            'id' => $log->id,
            'title' => $log->book?->title_statement,
            'returned_date' => $log->returned_date?->timezone('Asia/Manila')->toIso8601String(),
            'fine_incurred' => (float) $log->fine_incurred,
            'fine_cleared_at' => $log->fine_cleared_at?->timezone('Asia/Manila')->toIso8601String(),
            'fine_clearance_type' => $log->fine_clearance_type,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeHistoryLog(LibraryBookLog $log): array
    {
        return [
            'id' => $log->id,
            'timestamp_manila' => $log->timestamp_manila,
            'title' => $log->book?->title_statement,
            'barcode' => $log->book?->barcode,
            'status' => $log->status,
            'history_summary' => $log->historySummary(),
            'due_date' => $log->due_date?->format('Y-m-d'),
            'returned_date' => $log->returned_date?->timezone('Asia/Manila')->toIso8601String(),
            'renew_count' => (int) ($log->renew_count ?? 0),
            'circulation_type' => $log->circulation_type ?? LibraryBookLog::CIRCULATION_CHECKOUT,
            'fine_incurred' => $log->fine_incurred !== null ? (float) $log->fine_incurred : null,
        ];
    }
}
