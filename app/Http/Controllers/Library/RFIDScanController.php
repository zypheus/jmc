<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RFIDScanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Library/Rfid/Scanner');
    }

    public function scan(Request $request)
    {
        $code = trim((string) ($request->input('copy_identifier') ?: $request->input('rfid')));

        $request->validate([
            'copy_identifier' => 'nullable|string|max:255',
            'rfid' => 'nullable|string|max:255',
        ]);

        if ($code === '') {
            return response()->json(['error' => 'No copy code provided.'], 422);
        }

        $book = LibraryBook::findByCopyIdentifier($code);

        if (! $book) {
            return response()->json(['error' => 'No copy found for that accession, barcode, or RFID.'], 404);
        }

        // Check the last status of the book
        $lastLog = LibraryBookLog::where('book_id', $book->id)->latest()->first();
        if (! $lastLog || $lastLog->status === 'Checked In') {
            return response()->json(['alert' => 'Book is not yet checked out!'], 200);
        }

        return response()->json(['success' => 'Book is properly checked out.'], 200);
    }
}
