<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Exports\FeedbackExport;
use App\Domain\Library\Models\LibraryFeedback;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Domain\Library\Support\PerPage;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class FeedbackController extends Controller
{
    public function create()
    {
        return view('library_feedback');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'comments' => 'required|string',
        ]);

        LibraryFeedback::create([
            'name' => $request->name,
            'email' => $request->email,
            'comments' => $request->comments,
        ]);

        $preview = Str::limit($request->comments, 120);
        AdminActivityLogger::feedback($preview);

        return redirect()->back()->with('success', 'Thank you! Your feedback has been submitted.');
    }

    public function index(Request $request)
    {
        $now = now('Asia/Manila');

        $stats = [
            'total' => LibraryFeedback::count(),
            'this_week' => LibraryFeedback::where('created_at', '>=', $now->copy()->startOfWeek())->count(),
            'this_month' => LibraryFeedback::where('created_at', '>=', $now->copy()->startOfMonth())->count(),
        ];

        $feedbacks = $this->sortedFilteredQuery($request)
            ->paginate(PerPage::resolve($request, 10))
            ->withQueryString();

        return view('feedbacks.index', compact('feedbacks', 'stats'));
    }

    public function exportCsv(Request $request)
    {
        $feedbacks = $this->sortedFilteredQuery($request)->get();

        $filename = 'student_feedback_'.now('Asia/Manila')->format('Y-m-d_His').'.csv';

        return Excel::download(new FeedbackExport($feedbacks), $filename, \Maatwebsite\Excel\Excel::CSV);
    }

    private function sortedFilteredQuery(Request $request): Builder
    {
        return $this->filteredQuery($request)
            ->when(
                $request->input('sort') === 'oldest',
                fn (Builder $q) => $q->orderBy('created_at'),
                fn (Builder $q) => $q->latest()
            );
    }

    private function filteredQuery(Request $request): Builder
    {
        return LibraryFeedback::query()
            ->when($request->filled('from'), fn (Builder $q) => $q->whereDate('created_at', '>=', $request->from))
            ->when($request->filled('to'), fn (Builder $q) => $q->whereDate('created_at', '<=', $request->to))
            ->when($request->filled('search'), function (Builder $q) use ($request) {
                $search = $request->search;

                $q->where(function (Builder $query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('comments', 'like', "%{$search}%");
                });
            })
            ->when($request->contact === 'anonymous', function (Builder $q) {
                $q->where(function (Builder $query) {
                    $query->whereNull('name')->orWhere('name', '');
                })->where(function (Builder $query) {
                    $query->whereNull('email')->orWhere('email', '');
                });
            })
            ->when($request->contact === 'identified', function (Builder $q) {
                $q->where(function (Builder $query) {
                    $query->where(function (Builder $inner) {
                        $inner->whereNotNull('name')->where('name', '!=', '');
                    })->orWhere(function (Builder $inner) {
                        $inner->whereNotNull('email')->where('email', '!=', '');
                    });
                });
            });
    }
}
