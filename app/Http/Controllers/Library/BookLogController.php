<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryBookReservation;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryFineSetting;
use App\Domain\Library\Models\LibraryHoliday;
use App\Domain\Library\Models\LibrarySetting;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Domain\Library\Support\LoanDueDate;
use App\Domain\Library\Support\PerPage;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookLogController extends Controller
{
    protected function calculateOverdueDays(Carbon $dueDate, Carbon $returnedDate, int $gracePeriod = 0)
    {
        if ($returnedDate->lessThanOrEqualTo($dueDate)) {
            return 0;
        }

        $holidays = LibraryHoliday::pluck('holiday_date')->map(function ($d) {
            return Carbon::parse($d)->startOfDay()->toDateString();
        });

        $overdueDays = 0;
        $current = $dueDate->copy()->addDay()->startOfDay();

        while ($current->lessThanOrEqualTo($returnedDate)) {
            $isWeekend = $current->isWeekend();
            $isHoliday = $holidays->contains($current->toDateString());

            if (! $isWeekend && ! $isHoliday) {
                $overdueDays++;
            }

            $current->addDay();
        }

        return max(0, $overdueDays - $gracePeriod);
    }

    protected function addBusinessDays(Carbon $start, int $days)
    {
        $holidays = LibraryHoliday::pluck('holiday_date')->map(function ($d) {
            return Carbon::parse($d)->startOfDay()->toDateString();
        });

        $date = $start->copy()->startOfDay();
        $added = 0;

        while ($added < $days) {
            $date->addDay();

            $isWeekend = $date->isWeekend();
            $isHoliday = $holidays->contains($date->toDateString());

            if (! $isWeekend && ! $isHoliday) {
                $added++;
            }
        }

        return $date;
    }

    /**
     * Cooldown: after returning a book, the same student must wait before borrowing the same book again.
     */
    protected function enforceReborrowCooldownOrNull(?int $studentId, ?int $employeeId, int $bookId): ?string
    {
        $latestReturn = LibraryBookLog::query()
            ->where('book_id', $bookId)
            ->where('status', 'Checked In')
            ->whereNotNull('returned_date')
            ->when($studentId, fn ($q) => $q->where('student_id', $studentId))
            ->when($employeeId, fn ($q) => $q->where('employee_id', $employeeId))
            ->orderByDesc('returned_date')
            ->value('returned_date');

        if (! $latestReturn) {
            return null;
        }

        $returnedAt = Carbon::parse($latestReturn)->timezone('Asia/Manila');
        $allowedAt = $returnedAt->copy()->addDays(LibrarySetting::reborrowCooldownDays());
        $now = Carbon::now('Asia/Manila');

        if ($now->lt($allowedAt)) {
            return 'This patron must wait '.LibrarySetting::reborrowCooldownDays().' days after returning this book before borrowing it again. (Available again on '.$allowedAt->format('M j, Y').')';
        }

        return null;
    }

    public function index(Request $request)
    {
        $logs = LibraryBookLog::with(['book', 'student', 'employee']);

        if ($request->filled('student_id')) {
            $student = LibraryStudent::find($request->student_id);
            if ($student) {
                $legacyComma = "{$student->lastname}, {$student->firstname}";
                $legacySpace = trim("{$student->firstname} {$student->lastname}");
                $logs->where(function ($q) use ($student, $legacyComma, $legacySpace) {
                    $q->where('student_id', $student->id)
                        ->orWhere('patron_name', $legacyComma)
                        ->orWhere('patron_name', $legacySpace);
                });
            }
        } elseif ($request->filled('employee_id')) {
            $employee = LibraryEmployee::find($request->employee_id);
            if ($employee) {
                $legacyComma = "{$employee->lastname}, {$employee->firstname}";
                $legacySpace = trim("{$employee->firstname} {$employee->lastname}");
                $logs->where(function ($q) use ($employee, $legacyComma, $legacySpace) {
                    $q->where('employee_id', $employee->id)
                        ->orWhere('patron_name', $legacyComma)
                        ->orWhere('patron_name', $legacySpace);
                });
            }
        } elseif ($request->filled('filter_patron')) {
            $term = trim((string) $request->filter_patron);
            if ($term !== '') {
                $logs->where(function ($q) use ($term) {
                    $q->where('patron_name', 'like', '%'.$term.'%')
                        ->orWhereHas('student', function ($s) use ($term) {
                            $s->where('firstname', 'like', '%'.$term.'%')
                                ->orWhere('lastname', 'like', '%'.$term.'%')
                                ->orWhere('id_number', 'like', '%'.$term.'%')
                                ->orWhereRaw(
                                    'LOWER(CONCAT(firstname, \' \', lastname)) LIKE ?',
                                    ['%'.strtolower($term).'%']
                                );
                        })
                        ->orWhereHas('employee', function ($e) use ($term) {
                            $e->where('firstname', 'like', '%'.$term.'%')
                                ->orWhere('lastname', 'like', '%'.$term.'%')
                                ->orWhere('employee_id', 'like', '%'.$term.'%')
                                ->orWhereRaw(
                                    'LOWER(CONCAT(firstname, \' \', lastname)) LIKE ?',
                                    ['%'.strtolower($term).'%']
                                );
                        });
                });
            }
        }

        if ($request->filled('book_title')) {
            $titleTerm = trim((string) $request->book_title);
            $logs->whereHas('book', function ($query) use ($titleTerm) {
                $query->where('title_statement', 'like', '%'.$titleTerm.'%');
            });
        }

        if ($request->filled('start_date')) {
            $logs->whereDate('timestamp', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $logs->whereDate('timestamp', '<=', $request->end_date);
        }

        if ($request->filled('circulation_type') && in_array($request->circulation_type, ['checkout', 'room_use'], true)) {
            if ($request->circulation_type === 'room_use') {
                $logs->where('circulation_type', LibraryBookLog::CIRCULATION_ROOM_USE);
            } else {
                $logs->where(function ($q) {
                    $q->where('circulation_type', LibraryBookLog::CIRCULATION_CHECKOUT)
                        ->orWhereNull('circulation_type');
                });
            }
        }

        $logs = $logs->latest()->paginate(PerPage::resolve($request, 10))->withQueryString();

        $prefillPatronLabel = '';
        if ($request->filled('student_id')) {
            $ps = LibraryStudent::find($request->student_id);
            if ($ps) {
                $prefillPatronLabel = $this->patronDisplayLabel($ps);
            }
        } elseif ($request->filled('employee_id')) {
            $pe = LibraryEmployee::find($request->employee_id);
            if ($pe) {
                $prefillPatronLabel = $this->employeeDisplayLabel($pe);
            }
        } elseif ($request->filled('filter_patron')) {
            $prefillPatronLabel = trim((string) $request->filter_patron);
        }

        $filterBookTitle = trim((string) $request->input('book_title', ''));

        $prefillCopyIdentifier = trim((string) $request->input(
            'copy_identifier',
            $request->input('rfid', '')
        ));

        $prefillCopyReserved = false;
        $prefillReservationStudentId = null;
        if ($prefillCopyIdentifier !== '') {
            $prefillBook = LibraryBook::findByCopyIdentifier($prefillCopyIdentifier);
            if ($prefillBook) {
                $prefillCopyReserved = $prefillBook->isReserved();
                $activeHold = LibraryBookReservation::activeForBook((int) $prefillBook->id);
                if ($activeHold && $activeHold->student && $prefillBook->availability !== 'Borrowed') {
                    if (! $request->filled('student_id') && ! $request->filled('employee_id') && $prefillPatronLabel === '') {
                        $prefillPatronLabel = $this->patronDisplayLabel($activeHold->student);
                        $prefillReservationStudentId = $activeHold->student_id;
                    }
                }
            }
        }

        $fineSettings = LibraryFineSetting::latest('created_at')->first();
        $loanDefaultDaysStudent = $fineSettings?->studentLoanDurationDays() ?? LibraryFineSetting::DEFAULT_LOAN_DURATION_DAYS;
        $loanDefaultDaysEmployee = $fineSettings?->employeeLoanDurationDays() ?? LibraryFineSetting::DEFAULT_LOAN_DURATION_DAYS;

        return Inertia::render('Library/Logs/Index', [
            'logs' => $logs,
            'prefill' => [
                'patronLabel' => $prefillPatronLabel,
                'studentId' => $request->filled('student_id')
                    ? (int) $request->student_id
                    : ($prefillReservationStudentId ?? null),
                'employeeId' => $request->filled('employee_id') ? (int) $request->employee_id : null,
                'copyIdentifier' => $prefillCopyIdentifier,
                'copyReserved' => $prefillCopyReserved,
                'status' => ($prefillCopyReserved ?? false)
                    ? 'room_use'
                    : ($request->input('status', 'checked_out')),
            ],
            'loanDefaults' => [
                'studentDays' => $loanDefaultDaysStudent,
                'employeeDays' => $loanDefaultDaysEmployee,
            ],
            'filters' => [
                'filter_patron' => $request->input('filter_patron', ''),
                'book_title' => $filterBookTitle,
                'start_date' => $request->input('start_date', ''),
                'end_date' => $request->input('end_date', ''),
                'circulation_type' => $request->input('circulation_type', ''),
                'student_id' => $request->input('student_id', ''),
                'employee_id' => $request->input('employee_id', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $copyCode = trim((string) ($request->input('copy_identifier') ?: $request->input('rfid')));

        $request->validate([
            'copy_identifier' => 'nullable|string|max:255',
            'rfid' => 'nullable|string|max:255',
            'status' => 'required|string|in:checked_out,room_use,checked_in',
            'student_id' => 'nullable|integer|exists:library_students,id|required_without:employee_id',
            'employee_id' => 'nullable|integer|exists:library_employees,id|required_without:student_id',
            'due_date' => 'nullable|date|after_or_equal:today',
            'loan_duration_days' => 'nullable|integer|min:1|max:365',
        ]);

        if ($copyCode === '') {
            return back()->withInput()->with('error', 'Enter the copy accession number, barcode, or RFID.');
        }

        $book = LibraryBook::findByCopyIdentifier($copyCode);

        if (! $book) {
            return back()->withInput()->with(
                'error',
                'No copy found for that code. Use accession number (recommended), barcode, or RFID.'
            );
        }

        $action = $request->status;
        if ($action === 'checked_out' && $book->isReserved()) {
            return back()->withInput()->with(
                'error',
                'This copy is reserved for room use only and cannot be checked out.'
            );
        }

        $student = null;
        $employee = null;
        $studentId = $request->filled('student_id') ? (int) $request->student_id : null;
        $employeeId = $request->filled('employee_id') ? (int) $request->employee_id : null;

        if ($employeeId) {
            $employee = LibraryEmployee::findOrFail($employeeId);
            $patronName = "{$employee->lastname}, {$employee->firstname}";
            if ($employee->middle_initial) {
                $patronName .= ' '.$employee->middle_initial.'.';
            }
        } else {
            $student = LibraryStudent::findOrFail($studentId);
            $patronName = "{$student->lastname}, {$student->firstname}";
        }

        $action = $request->status;
        $isOutbound = in_array($action, ['checked_out', 'room_use'], true);

        $lastLog = LibraryBookLog::where('book_id', $book->id)
            ->latest('timestamp')
            ->first();

        if ($isOutbound && $lastLog && $lastLog->status === 'Checked Out') {
            return back()->with('error', 'This book is already on loan (check in first).');
        }

        if ($action === 'checked_in' && (! $lastLog || $lastLog->status !== 'Checked Out')) {
            return back()->with('error', 'This book is already checked in.');
        }

        if ($action === 'checked_in' && $lastLog) {
            if ($employeeId && $lastLog->employee_id) {
                if ($employeeId !== (int) $lastLog->employee_id) {
                    return back()->with('error', 'Patron must match the faculty/staff member who has this book.');
                }
            } elseif ($studentId && $lastLog->student_id) {
                if ($studentId !== (int) $lastLog->student_id) {
                    return back()->with('error', 'Patron must match the student who has this book.');
                }
            }
        }

        if ($isOutbound) {
            $cooldownError = $this->enforceReborrowCooldownOrNull($studentId, $employeeId, (int) $book->id);
            if ($cooldownError) {
                return back()->with('error', $cooldownError);
            }

            $active = $studentId
                ? LibraryBookLog::countActiveLoansForStudent($studentId)
                : LibraryBookLog::countActiveLoansForEmployee($employeeId);

            if ($studentId) {
                if (LibrarySetting::wouldExceedStudentLoanLimit($active)) {
                    $studentMax = LibrarySetting::maxLoansForStudents();

                    return back()->with(
                        'error',
                        'This patron already has the maximum of '.$studentMax.' books on loan (including room use). Check one in first, or use check out only for books taken outside the library.'
                    );
                }
            } elseif (LibrarySetting::wouldExceedEmployeeLoanLimit($active)) {
                $employeeMax = LibrarySetting::maxLoansForEmployees();

                return back()->with(
                    'error',
                    'This patron already has the maximum of '.$employeeMax.' books on loan (including room use). Check one in first, or use check out only for books taken outside the library.'
                );
            }
        }

        if ($isOutbound && $action === 'checked_out') {
            $holdError = LibraryBookReservation::copyBlockedForStudent($book, $studentId);
            if ($holdError) {
                return back()->withInput()->with('error', $holdError);
            }
        }

        $newStatus = $isOutbound ? 'Checked Out' : 'Checked In';
        if ($isOutbound) {
            $book->availability = 'Borrowed';
        } else {
            LibraryBookReservation::activatePendingForBook($book);
        }

        $circulationType = LibraryBookLog::CIRCULATION_CHECKOUT;
        if ($isOutbound && $action === 'room_use') {
            $circulationType = LibraryBookLog::CIRCULATION_ROOM_USE;
        } elseif (! $isOutbound && $lastLog) {
            $circulationType = $lastLog->circulation_type ?? LibraryBookLog::CIRCULATION_CHECKOUT;
        }

        $settings = LibraryFineSetting::latest('created_at')->first();

        $dueDate = null;
        $returnedDate = null;
        $fineIncurred = null;

        if ($isOutbound && $action === 'checked_out') {
            $loanTerms = LoanDueDate::resolveFromRequest(
                Carbon::now('Asia/Manila'),
                $settings,
                $request->input('due_date'),
                $request->filled('loan_duration_days') ? (int) $request->loan_duration_days : null,
                (bool) $employeeId,
            );
            $dueDate = $loanTerms['due_date'];
        }

        if ($action === 'checked_in') {
            $returnedDate = Carbon::now('Asia/Manila');

            if ($lastLog && $lastLog->due_date) {
                $dueDate = $lastLog->due_date;

                $isEmployeePatron = (bool) ($employeeId ?: $lastLog?->employee_id);
                $patronTerms = $settings
                    ? $settings->patronTerms($isEmployeePatron)
                    : (object) ['grace_period_days' => 0, 'fine_per_day' => 0, 'max_fine' => null];
                $gracePeriod = $patronTerms->grace_period_days ?? 0;
                $finePerDay = $patronTerms->fine_per_day ?? 0;
                $maxFine = $patronTerms->max_fine;

                $overdueDays = $this->calculateOverdueDays(
                    Carbon::parse($dueDate)->startOfDay(),
                    $returnedDate->copy()->startOfDay(),
                    $gracePeriod
                );

                $fineIncurred = $overdueDays * $finePerDay;

                if ($overdueDays > 0) {
                    session()->flash('overdue_modal', [
                        'book_title' => $book->title_statement,
                        'patron_name' => $patronName,
                        'days_late' => $overdueDays,
                        'fine' => $fineIncurred,
                        'breakdown' => "{$overdueDays} day(s) × ₱".number_format($finePerDay, 2).' = ₱'.number_format($fineIncurred, 2),
                    ]);
                }

                if (! is_null($maxFine)) {
                    $fineIncurred = min($fineIncurred, $maxFine);
                }
            }
        }

        LibraryBookLog::create([
            'book_id' => $book->id,
            'student_id' => $studentId,
            'employee_id' => $employeeId,
            'patron_name' => $patronName,
            'status' => $newStatus,
            'circulation_type' => $circulationType,
            'renew_count' => 0,
            'timestamp' => Carbon::now('Asia/Manila'),
            'due_date' => $dueDate,
            'returned_date' => $returnedDate,
            'fine_incurred' => $fineIncurred,
        ]);

        if ($isOutbound && $action === 'checked_out' && $studentId) {
            LibraryBookReservation::fulfillForBookAndStudent((int) $book->id, $studentId);
        }

        $book->save();

        if ($action === 'checked_out') {
            AdminActivityLogger::circulation(
                'Book checked out',
                "{$patronName} — «{$book->title_statement}»",
            );
        } elseif ($action === 'checked_in') {
            AdminActivityLogger::circulation(
                'Book checked in',
                "{$patronName} returned «{$book->title_statement}»",
            );
        } elseif ($action === 'room_use') {
            AdminActivityLogger::circulation(
                'Room use recorded',
                "{$patronName} — «{$book->title_statement}» (in library)",
            );
        }

        if ($action === 'room_use') {
            return back()->with('success', 'Room use recorded (in library only). Remind the patron to check in when finished.');
        }

        return back()->with('success', "Book has been {$newStatus} successfully!");
    }

    public function renew(Request $request, LibraryBook $book)
    {
        $request->validate([
            'student_id' => 'required|integer|exists:library_students,id',
        ]);

        $studentId = (int) $request->student_id;

        $lastLog = LibraryBookLog::query()
            ->where('book_id', $book->id)
            ->latest('timestamp')
            ->first();

        if (! $lastLog || $lastLog->status !== 'Checked Out') {
            return back()->with('error', 'This book is not currently checked out.');
        }

        if ((int) $lastLog->student_id !== $studentId) {
            return back()->with('error', 'Only the patron who borrowed this book can renew it.');
        }

        if (($lastLog->circulation_type ?? LibraryBookLog::CIRCULATION_CHECKOUT) !== LibraryBookLog::CIRCULATION_CHECKOUT) {
            return back()->with('error', 'Room-use loans cannot be renewed.');
        }

        if (! $lastLog->due_date) {
            return back()->with('error', 'This loan has no due date to renew.');
        }

        $renewCount = (int) ($lastLog->renew_count ?? 0);
        $maxRenewals = LibrarySetting::maxRenewalsPerLoan();
        if ($renewCount >= $maxRenewals) {
            return back()->with('error', 'Renewal limit reached (max '.$maxRenewals.' renewals).');
        }

        if (LibraryBookReservation::blocksRenewal((int) $book->id)) {
            return back()->with('error', 'Renewal blocked: another patron has reserved this copy.');
        }

        $settings = LibraryFineSetting::latest('created_at')->first();
        $isEmployee = (bool) $lastLog->employee_id;
        $loanDays = (int) ($settings?->patronTerms($isEmployee)->loan_duration_days ?? LibraryFineSetting::DEFAULT_LOAN_DURATION_DAYS);

        $base = Carbon::parse($lastLog->due_date, 'Asia/Manila');
        $newDue = $this->addBusinessDays($base, $loanDays);

        $lastLog->due_date = $newDue;
        $lastLog->renew_count = $renewCount + 1;
        $lastLog->last_renewed_at = Carbon::now('Asia/Manila');
        $lastLog->save();

        AdminActivityLogger::circulation(
            'Loan renewed',
            "{$lastLog->patron_name} — «{$book->title_statement}» (due {$newDue->format('Y-m-d')})",
        );

        return back()->with('success', 'Loan renewed. New due date: '.$newDue->format('Y-m-d').'. ('.$lastLog->renew_count.'/'.$maxRenewals.' renewals used)');
    }

    protected function patronDisplayLabel(LibraryStudent $s): string
    {
        $label = "{$s->lastname}, {$s->firstname}";
        if ($s->id_number) {
            $label .= " ({$s->id_number})";
        }

        return $label;
    }

    protected function employeeDisplayLabel(LibraryEmployee $e): string
    {
        $label = "{$e->lastname}, {$e->firstname}";
        if ($e->middle_initial) {
            $label .= ' '.$e->middle_initial.'.';
        }
        if ($e->employee_id) {
            $label .= " ({$e->employee_id})";
        }

        return $label.' · Staff';
    }

    /**
     * @return list<array{id: int, type: string, name: string}>
     */
    protected function patronSuggestionItems(string $search, int $limit = 10): array
    {
        if (trim($search) === '') {
            return [];
        }

        $students = LibraryStudent::query()
            ->where(function ($q) use ($search) {
                $q->where('firstname', 'LIKE', "%{$search}%")
                    ->orWhere('lastname', 'LIKE', "%{$search}%")
                    ->orWhere('id_number', 'LIKE', "%{$search}%")
                    ->orWhereRaw(
                        'LOWER(CONCAT(firstname, \' \', lastname)) LIKE ?',
                        ['%'.strtolower($search).'%']
                    );
            })
            ->limit($limit)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'type' => 'student',
                'name' => $this->patronDisplayLabel($s),
            ]);

        $employees = LibraryEmployee::query()
            ->where(function ($q) use ($search) {
                $q->where('firstname', 'LIKE', "%{$search}%")
                    ->orWhere('lastname', 'LIKE', "%{$search}%")
                    ->orWhere('employee_id', 'LIKE', "%{$search}%")
                    ->orWhere('designation', 'LIKE', "%{$search}%")
                    ->orWhereRaw(
                        'LOWER(CONCAT(firstname, \' \', lastname)) LIKE ?',
                        ['%'.strtolower($search).'%']
                    );
            })
            ->limit($limit)
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'type' => 'employee',
                'name' => $this->employeeDisplayLabel($e),
            ]);

        return $students->concat($employees)
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->take($limit)
            ->values()
            ->all();
    }

    public function bookTitleLogSuggestions(Request $request)
    {
        $search = trim((string) $request->get('query', ''));
        if ($search === '') {
            return response()->json([]);
        }

        $titles = LibraryBook::query()
            ->whereHas('logs')
            ->where('title_statement', 'like', '%'.$search.'%')
            ->whereNotNull('title_statement')
            ->orderBy('title_statement')
            ->pluck('title_statement')
            ->unique()
            ->take(12)
            ->values();

        return response()->json($titles->map(fn ($title) => ['title' => $title]));
    }

    public function patronSuggestions(Request $request)
    {
        $search = trim((string) $request->get('query', ''));

        return response()->json($this->patronSuggestionItems($search));
    }

    public function bookSuggestions(Request $request)
    {
        LibraryBookReservation::expireStale();

        $search = $request->get('query', '');

        $books = LibraryBook::whereNull('archived_at')->where(function ($q) use ($search) {
            $q->where('title_statement', 'LIKE', "%{$search}%")
                ->orWhere('main_author', 'LIKE', "%{$search}%")
                ->orWhere('accession_no', 'LIKE', "%{$search}%")
                ->orWhere('rfid', 'LIKE', "%{$search}%")
                ->orWhere('barcode', 'LIKE', "%{$search}%");
        })
            ->limit(10)
            ->get();

        $patronHolds = LibraryBookReservation::query()
            ->whereIn('book_id', $books->pluck('id'))
            ->active()
            ->with('student')
            ->get()
            ->keyBy('book_id');

        return response()->json(
            $books->map(function ($b) use ($patronHolds) {
                $lastCheckout = LibraryBookLog::with(['student', 'employee'])
                    ->where('book_id', $b->id)
                    ->where('status', 'Checked Out')
                    ->latest('timestamp')
                    ->first();

                $hold = $patronHolds->get($b->id);
                $holdStudent = $hold?->student;

                return [
                    'id' => $b->id,
                    'title' => $b->title_statement,
                    'author' => $b->main_author,
                    'accession_no' => $b->accession_no,
                    'barcode' => $b->barcode,
                    'rfid' => $b->rfid,
                    'copy_identifier' => $b->copyIdentifierForCirculation(),
                    'copy_identifier_summary' => $b->copyIdentifierSummary(),
                    'availability' => $b->availability,
                    'reserved' => (bool) $b->reserved,
                    'patron_hold' => (bool) $hold,
                    'patron_hold_status' => $hold?->status,
                    'reservation_student_id' => $holdStudent?->id,
                    'reservation_student_name' => $holdStudent
                        ? $this->patronDisplayLabel($holdStudent)
                        : null,
                    'last_student_id' => $lastCheckout?->student_id,
                    'last_employee_id' => $lastCheckout?->employee_id,
                    'last_patron' => $lastCheckout ? $lastCheckout->patronLabel() : null,
                    'last_circulation_type' => $lastCheckout?->circulation_type,
                ];
            })
        );
    }
}
