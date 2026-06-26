<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookReservation;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use RuntimeException;

class BookReservationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|string',
            'book_id' => 'required|integer|exists:library_books,id',
        ]);

        $student = LibraryStudent::where('id_number', $request->student_id)->first();
        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'Student ID not found.',
            ], 422);
        }

        $book = LibraryBook::findOrFail((int) $request->book_id);

        try {
            $reservation = LibraryBookReservation::reserveForStudent($student, $book);
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        $book->refresh();

        $studentLabel = "{$student->lastname}, {$student->firstname}";
        AdminActivityLogger::bookReservation(
            $reservation,
            $studentLabel,
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
            ],
        ]);
    }
}
