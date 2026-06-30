<?php

namespace App\Domain\Library\Services;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryBookReservation;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryFineSetting;
use App\Domain\Library\Models\LibrarySetting;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Support\LoanDueDate;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OpacCheckoutService
{
    public function __construct(private readonly OpacPatronResolver $patrons) {}

    /**
     * @param  list<int>  $bookIds
     * @return array{patron: array<string, mixed>, books: list<array<string, mixed>>, due_date: string|null}
     */
    public function checkout(
        LibraryStudent|LibraryEmployee $patron,
        array $bookIds,
        ?string $dueDate = null,
        ?int $loanDurationDays = null,
    ): array {
        LibraryBookReservation::expireStale();

        $bookIds = array_values(array_unique(array_map('intval', $bookIds)));
        if ($bookIds === []) {
            throw new RuntimeException('No books were selected for checkout.');
        }

        if ($this->hasOverdueLoan($patron)) {
            throw new RuntimeException('Checkout blocked: this patron has overdue book(s).');
        }

        $settings = LibraryFineSetting::latest('created_at')->first();
        if (! $settings) {
            throw new RuntimeException('Fine and loan settings are not configured.');
        }

        $currentLoans = $patron instanceof LibraryStudent
            ? LibraryBookLog::countActiveLoansForStudent((int) $patron->id)
            : LibraryBookLog::countActiveLoansForEmployee((int) $patron->id);

        $wouldExceed = $patron instanceof LibraryStudent
            ? LibrarySetting::wouldExceedStudentLoanLimit($currentLoans, count($bookIds))
            : LibrarySetting::wouldExceedEmployeeLoanLimit($currentLoans, count($bookIds));

        if ($wouldExceed) {
            $maximum = $patron instanceof LibraryStudent
                ? LibrarySetting::maxLoansForStudents()
                : LibrarySetting::maxLoansForEmployees();
            throw new RuntimeException("Checkout blocked: this patron may have at most {$maximum} books on loan at a time.");
        }

        return DB::transaction(function () use ($patron, $bookIds, $settings, $dueDate, $loanDurationDays) {
            $borrowedAt = Carbon::now('Asia/Manila');
            $loanTerms = LoanDueDate::resolveFromRequest(
                $borrowedAt,
                $settings,
                $dueDate,
                $loanDurationDays,
                $patron instanceof LibraryEmployee,
            );

            $processed = [];

            foreach ($bookIds as $bookId) {
                $book = LibraryBook::query()->lockForUpdate()->find($bookId);
                if (! $this->copyEligibleForCheckout($book, $patron)) {
                    continue;
                }

                if ($this->isWithinReborrowCooldown($patron, $book)) {
                    continue;
                }

                LibraryBookLog::create([
                    'book_id' => $book->id,
                    'student_id' => $patron instanceof LibraryStudent ? $patron->id : null,
                    'employee_id' => $patron instanceof LibraryEmployee ? $patron->id : null,
                    'patron_name' => trim("{$patron->lastname}, {$patron->firstname}"),
                    'status' => 'Checked Out',
                    'circulation_type' => LibraryBookLog::CIRCULATION_CHECKOUT,
                    'renew_count' => 0,
                    'timestamp' => $borrowedAt,
                    'due_date' => $loanTerms['due_date'],
                    'fine_incurred' => 0,
                ]);

                $book->update(['availability' => 'Borrowed']);
                LibraryBookReservation::fulfillForBookAndPatron((int) $book->id, $patron);

                $processed[] = [
                    'id' => $book->id,
                    'title' => $book->title_statement,
                    'author' => $book->main_author,
                    'barcode' => $book->barcode,
                    'due_date' => $loanTerms['due_date']?->format('Y-m-d'),
                ];
            }

            if ($processed === []) {
                throw new RuntimeException('No selected copies could be checked out. They may be unavailable, held, or inside the re-borrow cooldown.');
            }

            AdminActivityLogger::selfCheckout(
                trim("{$patron->lastname}, {$patron->firstname}"),
                count($processed),
            );

            return [
                'patron' => $this->patrons->serialize($patron),
                'books' => $processed,
                'due_date' => $processed[array_key_last($processed)]['due_date'],
            ];
        });
    }

    private function hasOverdueLoan(LibraryStudent|LibraryEmployee $patron): bool
    {
        $column = $patron instanceof LibraryStudent ? 'student_id' : 'employee_id';

        return LibraryBookLog::query()
            ->where('status', 'Checked Out')
            ->whereNull('returned_date')
            ->whereDate('due_date', '<', now('Asia/Manila')->toDateString())
            ->where($column, $patron->id)
            ->exists();
    }

    private function copyEligibleForCheckout(
        ?LibraryBook $book,
        LibraryStudent|LibraryEmployee $patron,
    ): bool {
        if (! $book || $book->archived_at !== null || $book->isReserved()) {
            return false;
        }

        $hold = LibraryBookReservation::activeForBook((int) $book->id);
        if ($book->availability === 'On Hold') {
            return $hold
                && $hold->status === LibraryBookReservation::STATUS_READY
                && $hold->belongsToPatron($patron);
        }

        return $book->availability === 'Available' && $hold === null;
    }

    private function isWithinReborrowCooldown(
        LibraryStudent|LibraryEmployee $patron,
        LibraryBook $book,
    ): bool {
        $column = $patron instanceof LibraryStudent ? 'student_id' : 'employee_id';
        $latestReturn = LibraryBookLog::query()
            ->where($column, $patron->id)
            ->where('book_id', $book->id)
            ->where('status', 'Checked In')
            ->whereNotNull('returned_date')
            ->latest('returned_date')
            ->value('returned_date');

        if (! $latestReturn) {
            return false;
        }

        return now('Asia/Manila')->lt(
            Carbon::parse($latestReturn)->timezone('Asia/Manila')->addDays(LibrarySetting::reborrowCooldownDays()),
        );
    }
}
