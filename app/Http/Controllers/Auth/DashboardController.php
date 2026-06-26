<?php

namespace App\Http\Controllers\Auth;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendanceLog;
use App\Domain\Attendance\Models\AttendancePendingEmployee;
use App\Domain\Attendance\Models\AttendancePendingStudent;
use App\Domain\Attendance\Models\AttendanceStudent;
use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryPendingEmployee;
use App\Domain\Library\Models\LibraryPendingStudent;
use App\Domain\Library\Models\LibraryStudent;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasRole('super_admin')) {
            return redirect()->route('dashboard.super-admin');
        }

        if ($user->hasRole('library_admin')) {
            return redirect()->route('dashboard.library-admin');
        }

        if ($user->hasRole('library_staff')) {
            return redirect()->route('dashboard.library-staff');
        }

        if ($user->hasRole('attendance_admin')) {
            return redirect()->route('dashboard.attendance-admin');
        }

        if ($user->hasRole('attendance_staff')) {
            return redirect()->route('dashboard.attendance-staff');
        }

        abort(403, 'No dashboard available for your role.');
    }

    public function libraryAdmin(): Response
    {
        $latestLoanIds = DB::table('library_book_logs')
            ->selectRaw('MAX(id) as id')
            ->groupBy('book_id');

        $outstandingFinesCount = LibraryBookLog::query()
            ->where('status', 'Checked In')
            ->where(function ($query) {
                $query->where('fine_balance', '>', 0)
                    ->orWhere(function ($innerQuery) {
                        $innerQuery->whereNull('fine_balance')->where('fine_incurred', '>', 0);
                    });
            })
            ->whereNull('fine_cleared_at')
            ->count();

        return Inertia::render('Dashboard/LibraryAdmin', [
            'stats' => [
                'studentsCount' => LibraryStudent::count(),
                'employeesCount' => LibraryEmployee::count(),
                'booksCount' => LibraryBook::count(),
                'pendingCount' => LibraryPendingStudent::count() + LibraryPendingEmployee::count(),
                'outstandingFinesCount' => $outstandingFinesCount,
                'activeLoansCount' => LibraryBookLog::query()
                    ->whereIn('id', $latestLoanIds)
                    ->where('status', 'Checked Out')
                    ->count(),
            ],
        ]);
    }

    public function libraryStaff(): Response
    {
        return Inertia::render('Dashboard/LibraryStaff');
    }

    public function attendanceAdmin(): Response
    {
        $today = Carbon::now('Asia/Manila')->toDateString();
        $weekStart = Carbon::now('Asia/Manila')->startOfWeek(Carbon::MONDAY);
        $weekEnd = Carbon::now('Asia/Manila')->endOfWeek(Carbon::SUNDAY);

        return Inertia::render('Dashboard/AttendanceAdmin', [
            'stats' => [
                'studentsCount' => AttendanceStudent::count(),
                'employeesCount' => AttendanceEmployee::count(),
                'todayInCount' => AttendanceLog::query()
                    ->whereDate('scanned_at', $today)
                    ->whereRaw("LOWER(TRIM(status)) = 'in'")
                    ->count(),
                'pendingRegistrationsCount' => AttendancePendingStudent::count() + AttendancePendingEmployee::count(),
                'logsThisWeekCount' => AttendanceLog::query()
                    ->whereBetween('scanned_at', [$weekStart, $weekEnd])
                    ->count(),
            ],
        ]);
    }

    public function attendanceStaff(): Response
    {
        return Inertia::render('Dashboard/AttendanceStaff');
    }

    public function superAdmin(): Response
    {
        return Inertia::render('Dashboard/SuperAdmin');
    }
}
