<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryAttendanceFeedback;
use App\Domain\Library\Models\LibraryAttendanceSetting;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\UpdateFeedbackSettingsRequest;
use App\Http\Requests\Library\StoreLibraryAttendanceFeedbackRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibraryAttendanceFeedbackController extends Controller
{
    public function settings(): Response
    {
        return Inertia::render('Library/Attendance/FeedbackSettings', [
            'enabled' => LibraryAttendanceSetting::logoutFeedbackEnabled(),
        ]);
    }

    public function updateSettings(UpdateFeedbackSettingsRequest $request)
    {
        LibraryAttendanceSetting::setLogoutFeedbackEnabled($request->validated('enabled') === '1');

        return back()->with(
            'success',
            $request->validated('enabled') === '1'
                ? 'Logout feedback is now enabled on the attendance scanner.'
                : 'Logout feedback is now disabled on the attendance scanner.'
        );
    }

    public function index(Request $request): Response
    {
        $query = LibraryAttendanceFeedback::query()->with('student')->latest();

        if ($request->rating) {
            if ($request->rating === 'declined') {
                $query->where('declined', true);
            } else {
                $query->where('rating', $request->rating)->where('declined', false);
            }
        }

        $feedbacks = $query->paginate(20)->withQueryString();
        $all = LibraryAttendanceFeedback::query()->get();

        return Inertia::render('Library/Attendance/FeedbackResponses', [
            'feedbacks' => $feedbacks,
            'summary' => [
                'total' => $all->count(),
                'excellent' => $all->where('rating', 'excellent')->count(),
                'good' => $all->where('rating', 'good')->count(),
                'medium' => $all->where('rating', 'medium')->count(),
                'poor' => $all->where('rating', 'poor')->count(),
                'very_bad' => $all->where('rating', 'very_bad')->count(),
                'declined' => $all->where('declined', true)->count(),
            ],
            'filters' => $request->only(['rating']),
        ]);
    }

    public function store(StoreLibraryAttendanceFeedbackRequest $request)
    {
        if (! LibraryAttendanceSetting::logoutFeedbackEnabled()) {
            return response()->json(['success' => false, 'message' => 'Logout feedback is disabled.'], 403);
        }

        $validated = $request->validated();
        $declined = (bool) ($validated['declined'] ?? false);

        LibraryAttendanceFeedback::query()->create([
            'student_id' => $validated['student_id'],
            'rating' => $declined ? null : ($validated['rating'] ?? null),
            'declined' => $declined,
        ]);

        return response()->json(['success' => true]);
    }
}
