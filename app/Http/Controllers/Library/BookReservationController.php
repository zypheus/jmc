<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookReservation;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Domain\Library\Services\OpacPatronResolver;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use RuntimeException;

class BookReservationController extends Controller
{
    public function __construct(private readonly OpacPatronResolver $patrons) {}

    public function store(Request $request)
    {
        $request->validate([
            'patron_token' => 'nullable|string|max:255|required_without:student_id',
            'student_id' => 'nullable|string|max:255|required_without:patron_token',
            'book_id' => 'required|integer|exists:library_books,id',
        ]);

        $book = LibraryBook::findOrFail((int) $request->book_id);

        try {
            $patron = $this->patrons->resolve(
                trim((string) ($request->input('patron_token') ?: $request->input('student_id'))),
            );
            $reservation = LibraryBookReservation::reserveForPatron($patron, $book);
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        $book->refresh();

        $patronLabel = trim("{$patron->lastname}, {$patron->firstname}");
        AdminActivityLogger::bookReservation(
            $reservation,
            $patronLabel,
            $book->title_statement ?? 'Untitled',
        );

        return response()->json([
            'success' => true,
            'message' => $reservation->status === LibraryBookReservation::STATUS_PENDING
                ? 'Copy reserved. You will be first in line when it is returned.'
                : 'Copy reserved and placed on hold for you.',
            'reservation' => [
                'book_id' => $book->id,
                'status' => $reservation->status,
                'availability' => $book->availability,
                'patron' => $this->patrons->serialize($patron),
            ],
        ]);
    }
}
