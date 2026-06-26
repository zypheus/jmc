<?php

namespace App\Http\Controllers\Attendance;

use App\Domain\Attendance\Models\AttendanceFeedback;
use App\Domain\Attendance\Models\AttendanceSetting;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\StoreAttendanceFeedbackRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    public function store(StoreAttendanceFeedbackRequest $request)
    {
        if (! AttendanceSetting::logoutFeedbackEnabled()) {
            return response()->json(['success' => false, 'message' => 'Logout feedback is disabled.'], 403);
        }

        $validated = $request->validated();
        $declined = (bool) ($validated['declined'] ?? false);

        AttendanceFeedback::create([
            'student_id' => $validated['student_id'],
            'rating' => $declined ? null : ($validated['rating'] ?? null),
            'declined' => $declined,
        ]);

        return response()->json(['success' => true]);
    }

    public function index(Request $request): Response
    {
        $query = AttendanceFeedback::query()->with('student')->latest();

        if ($request->rating) {
            if ($request->rating === 'declined') {
                $query->where('declined', true);
            } else {
                $query->where('rating', $request->rating)->where('declined', false);
            }
        }

        $feedbacks = $query->paginate(20)->withQueryString();
        $all = AttendanceFeedback::query()->get();

        return Inertia::render('Attendance/Feedbacks/Index', [
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
}
