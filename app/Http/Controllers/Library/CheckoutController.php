<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Services\OpacCheckoutService;
use App\Domain\Library\Services\OpacPatronResolver;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly OpacPatronResolver $patrons,
        private readonly OpacCheckoutService $checkout,
    ) {}

    public function process(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patron_token' => 'nullable|string|max:255|required_without:student_id',
            'student_id' => 'nullable|string|max:255|required_without:patron_token',
            'book_id' => 'nullable|integer|exists:library_books,id',
            'books' => 'nullable|array|max:5',
            'books.*.id' => 'required_with:books|integer|exists:library_books,id',
            'due_date' => 'nullable|date|after_or_equal:today',
            'loan_duration_days' => 'nullable|integer|min:1|max:365',
        ]);

        $bookIds = [];
        if (! empty($validated['book_id'])) {
            $bookIds[] = (int) $validated['book_id'];
        }
        foreach ($validated['books'] ?? [] as $book) {
            $bookIds[] = (int) $book['id'];
        }

        return $this->performCheckout($request, $bookIds);
    }

    public function bulk(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patron_token' => 'nullable|string|max:255|required_without:student_id',
            'student_id' => 'nullable|string|max:255|required_without:patron_token',
            'book_ids' => 'required|array|min:1|max:5',
            'book_ids.*' => 'integer|distinct|exists:library_books,id',
            'due_date' => 'nullable|date|after_or_equal:today',
            'loan_duration_days' => 'nullable|integer|min:1|max:365',
        ]);

        return $this->performCheckout($request, array_map('intval', $validated['book_ids']));
    }

    /**
     * @param  list<int>  $bookIds
     */
    private function performCheckout(Request $request, array $bookIds): JsonResponse
    {
        try {
            $token = trim((string) ($request->input('patron_token') ?: $request->input('student_id')));
            $patron = $this->patrons->resolve($token);
            $result = $this->checkout->checkout(
                $patron,
                $bookIds,
                $request->input('due_date'),
                $request->filled('loan_duration_days') ? (int) $request->input('loan_duration_days') : null,
            );

            return response()->json([
                'success' => true,
                ...$result,
                'book' => count($result['books']) === 1 ? $result['books'][0] : null,
                'student' => $patron instanceof LibraryStudent ? [
                    ...$result['patron'],
                    'id_number' => $result['patron']['identifier'],
                ] : null,
                'library_books' => $result['books'],
            ]);
        } catch (RuntimeException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}
