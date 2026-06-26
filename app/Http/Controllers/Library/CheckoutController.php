<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryBookReservation;
use App\Domain\Library\Models\LibraryFineSetting;
use App\Domain\Library\Models\LibrarySetting;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Domain\Library\Support\LoanDueDate;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    public function process(Request $request)
    {
        Log::info('Checkout request data: ', $request->all());

        try {
            $request->validate([
                'student_id' => 'required|string',
                'book_id' => 'nullable|integer',
                'library_books' => 'nullable|array',
                'books.*.id' => 'required_with:books|integer',
                'due_date' => 'nullable|date|after_or_equal:today',
                'loan_duration_days' => 'nullable|integer|min:1|max:365',
            ]);

            $student = LibraryStudent::where('id_number', $request->student_id)->first();

            if (! $student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student ID not found.',
                ]);
            }

            $patronLegacyName = "{$student->lastname}, {$student->firstname}";

            $hasOverdue = LibraryBookLog::where('status', 'Checked Out')
                ->whereDate('due_date', '<', now())
                ->where(function ($q) use ($student, $patronLegacyName) {
                    $q->where('student_id', $student->id)
                        ->orWhere('patron_name', $patronLegacyName);
                })
                ->exists();

            if ($hasOverdue) {
                return response()->json([
                    'success' => false,
                    'message' => 'Checkout blocked: student has overdue book(s).',
                ]);
            }

            $bookIds = [];
            if ($request->book_id) {
                $bookIds[] = (int) $request->book_id;
            }
            if ($request->books) {
                foreach ($request->books as $b) {
                    $bookIds[] = (int) $b['id'];
                }
            }

            if ($bookIds === []) {
                return response()->json([
                    'success' => false,
                    'message' => 'No books provided.',
                ]);
            }

            $availableIds = [];
            $roomUseBlocked = [];
            $patronHoldBlocked = [];
            foreach (array_unique($bookIds) as $bookId) {
                $b = LibraryBook::find($bookId);
                if (! $this->copyEligibleForStudentCheckout($b, $student)) {
                    if ($b && $b->isReserved()) {
                        $roomUseBlocked[] = (int) $bookId;
                    } elseif ($b && LibraryBookReservation::copyBlockedForStudent($b, (int) $student->id)) {
                        $patronHoldBlocked[] = (int) $bookId;
                    }

                    continue;
                }
                $availableIds[] = (int) $bookId;
            }

            if ($availableIds === [] && $patronHoldBlocked !== []) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more copies are reserved for another patron.',
                ]);
            }

            if ($availableIds === [] && $roomUseBlocked !== []) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more copies are reserved for room use only and cannot be checked out.',
                ]);
            }

            if ($availableIds === []) {
                return response()->json([
                    'success' => false,
                    'message' => 'No available copies could be checked out.',
                ]);
            }

            $currentLoans = LibraryBookLog::countActiveLoansForStudent((int) $student->id);
            $studentMax = LibrarySetting::maxLoansForStudents();
            if (LibrarySetting::wouldExceedStudentLoanLimit($currentLoans, count($availableIds))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Checkout blocked: patron may have at most '.$studentMax.' books on loan at a time (including room use).',
                ]);
            }

            $fineSetting = LibraryFineSetting::orderBy('created_at', 'desc')->first();

            if (! $fineSetting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fine settings not configured.',
                ]);
            }

            $borrowedAt = Carbon::now('Asia/Manila');
            $loanTerms = LoanDueDate::resolveFromRequest(
                $borrowedAt,
                $fineSetting,
                $request->input('due_date'),
                $request->filled('loan_duration_days') ? (int) $request->loan_duration_days : null,
                false,
            );
            $dueDate = $loanTerms['due_date'];
            $processedBooks = [];

            foreach ($availableIds as $bookId) {
                $book = LibraryBook::find($bookId);

                if (! $this->copyEligibleForStudentCheckout($book, $student)) {
                    continue;
                }

                $latestReturn = LibraryBookLog::query()
                    ->where('student_id', $student->id)
                    ->where('book_id', $book->id)
                    ->where('status', 'Checked In')
                    ->whereNotNull('returned_date')
                    ->orderByDesc('returned_date')
                    ->value('returned_date');

                if ($latestReturn) {
                    $returnedAt = Carbon::parse($latestReturn)->timezone('Asia/Manila');
                    $allowedAt = $returnedAt->copy()->addDays(LibrarySetting::reborrowCooldownDays());
                    $nowManila = Carbon::now('Asia/Manila');
                    if ($nowManila->lt($allowedAt)) {
                        continue;
                    }
                }

                LibraryBookLog::create([
                    'book_id' => $book->id,
                    'student_id' => $student->id,
                    'patron_name' => $patronLegacyName,
                    'status' => 'Checked Out',
                    'circulation_type' => LibraryBookLog::CIRCULATION_CHECKOUT,
                    'renew_count' => 0,
                    'timestamp' => $borrowedAt,
                    'due_date' => $dueDate,
                    'fine_incurred' => 0,
                ]);

                $book->update(['availability' => 'Borrowed']);
                LibraryBookReservation::fulfillForBookAndStudent((int) $book->id, (int) $student->id);

                $processedBooks[] = [
                    'id' => $book->id,
                    'title' => $book->title_statement,
                    'author' => $book->main_author,
                    'barcode' => $book->barcode,
                    'due_date' => $dueDate->format('Y-m-d'),
                ];
            }

            if ($processedBooks === []) {
                return response()->json([
                    'success' => false,
                    'message' => 'No available copies could be checked out (some may be blocked by the 1-week re-borrow cooldown).',
                ]);
            }

            AdminActivityLogger::selfCheckout($patronLegacyName, count($processedBooks));

            return response()->json([
                'success' => true,
                'student' => [
                    'name' => $patronLegacyName,
                    'id_number' => $student->id_number,
                    'course' => $student->course,
                ],
                'library_books' => $processedBooks,
                'book' => count($processedBooks) === 1 ? $processedBooks[0] : null,
                'due_date' => $processedBooks[count($processedBooks) - 1]['due_date'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Checkout Exception: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred: '.$e->getMessage(),
            ], 500);
        }
    }

    public function bulk(Request $request)
    {
        $request->validate([
            'student_id' => 'required|string',
            'book_ids' => 'required|array',
            'due_date' => 'nullable|date|after_or_equal:today',
            'loan_duration_days' => 'nullable|integer|min:1|max:365',
        ]);

        $student = LibraryStudent::where('id_number', $request->student_id)->first();

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ]);
        }

        $patronLegacyName = "{$student->lastname}, {$student->firstname}";

        $hasOverdue = LibraryBookLog::where('status', 'Checked Out')
            ->whereDate('due_date', '<', now())
            ->where(function ($q) use ($student, $patronLegacyName) {
                $q->where('student_id', $student->id)
                    ->orWhere('patron_name', $patronLegacyName);
            })
            ->exists();

        if ($hasOverdue) {
            return response()->json([
                'success' => false,
                'message' => 'Checkout blocked: student has overdue book(s).',
            ]);
        }

        $fineSetting = LibraryFineSetting::latest()->first();
        if (! $fineSetting) {
            return response()->json(['success' => false, 'message' => 'Fine settings not configured.']);
        }

        $availableIds = [];
        $roomUseBlocked = [];
        $patronHoldBlocked = [];
        foreach ($request->book_ids as $bookId) {
            $book = LibraryBook::find($bookId);
            if (! $this->copyEligibleForStudentCheckout($book, $student)) {
                if ($book && $book->isReserved()) {
                    $roomUseBlocked[] = (int) $book->id;
                } elseif ($book && LibraryBookReservation::copyBlockedForStudent($book, (int) $student->id)) {
                    $patronHoldBlocked[] = (int) $book->id;
                }

                continue;
            }
            $availableIds[] = (int) $book->id;
        }

        if ($availableIds === [] && $patronHoldBlocked !== []) {
            return response()->json([
                'success' => false,
                'message' => 'One or more copies are reserved for another patron.',
            ]);
        }

        if ($availableIds === [] && $roomUseBlocked !== []) {
            return response()->json([
                'success' => false,
                'message' => 'One or more copies are reserved for room use only and cannot be checked out.',
            ]);
        }

        if ($availableIds === []) {
            return response()->json(['success' => false, 'message' => 'No available copies could be checked out.']);
        }

        $currentLoans = LibraryBookLog::countActiveLoansForStudent((int) $student->id);
        $studentMax = LibrarySetting::maxLoansForStudents();
        if (LibrarySetting::wouldExceedStudentLoanLimit($currentLoans, count($availableIds))) {
            return response()->json([
                'success' => false,
                'message' => 'Checkout blocked: patron may have at most '.$studentMax.' books on loan at a time.',
            ]);
        }

        $borrowedAt = Carbon::now('Asia/Manila');
        $loanTerms = LoanDueDate::resolveFromRequest(
            $borrowedAt,
            $fineSetting,
            $request->input('due_date'),
            $request->filled('loan_duration_days') ? (int) $request->loan_duration_days : null,
            false,
        );
        $dueDate = $loanTerms['due_date'];
        $results = [];

        foreach ($availableIds as $bookId) {
            $book = LibraryBook::find($bookId);

            if (! $this->copyEligibleForStudentCheckout($book, $student)) {
                continue;
            }

            $latestReturn = LibraryBookLog::query()
                ->where('student_id', $student->id)
                ->where('book_id', $book->id)
                ->where('status', 'Checked In')
                ->whereNotNull('returned_date')
                ->orderByDesc('returned_date')
                ->value('returned_date');

            if ($latestReturn) {
                $returnedAt = Carbon::parse($latestReturn)->timezone('Asia/Manila');
                $allowedAt = $returnedAt->copy()->addDays(LibrarySetting::reborrowCooldownDays());
                $nowManila = Carbon::now('Asia/Manila');
                if ($nowManila->lt($allowedAt)) {
                    continue;
                }
            }

            LibraryBookLog::create([
                'book_id' => $book->id,
                'student_id' => $student->id,
                'patron_name' => $patronLegacyName,
                'status' => 'Checked Out',
                'circulation_type' => LibraryBookLog::CIRCULATION_CHECKOUT,
                'renew_count' => 0,
                'timestamp' => $borrowedAt,
                'due_date' => $dueDate,
                'fine_incurred' => 0,
            ]);

            $book->update(['availability' => 'Borrowed']);
            LibraryBookReservation::fulfillForBookAndStudent((int) $book->id, (int) $student->id);

            $results[] = [
                'id' => $book->id,
                'title' => $book->title_statement,
                'author' => $book->main_author,
                'barcode' => $book->barcode,
                'due_date' => $dueDate->format('Y-m-d'),
            ];
        }

        if ($results !== []) {
            AdminActivityLogger::selfCheckout($patronLegacyName, count($results));
        }

        return response()->json([
            'success' => true,
            'student' => [
                'name' => $patronLegacyName,
                'id_number' => $student->id_number,
            ],
            'library_books' => $results,
        ]);
    }

    private function copyEligibleForStudentCheckout(?LibraryBook $book, LibraryStudent $student): bool
    {
        if (! $book || $book->archived_at !== null) {
            return false;
        }

        if ($book->isReserved()) {
            return false;
        }

        if (LibraryBookReservation::copyBlockedForStudent($book, (int) $student->id)) {
            return false;
        }

        if ($book->availability === 'On Hold') {
            $hold = LibraryBookReservation::activeForBook((int) $book->id);

            return $hold
                && $hold->status === LibraryBookReservation::STATUS_READY
                && (int) $hold->student_id === (int) $student->id;
        }

        if ($book->availability === 'Available') {
            return LibraryBookReservation::activeForBook((int) $book->id) === null;
        }

        return false;
    }
}
