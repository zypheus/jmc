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
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Services\LibraryNavigationStatusService;
use App\Http\Controllers\Controller;
use App\Services\Auth\ModuleAccessService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly ModuleAccessService $moduleAccess,
        private readonly LibraryNavigationStatusService $libraryNavigationStatus,
    ) {}

    public function index(Request $request): RedirectResponse
    {
        $user = $request->user();
        $activeModule = $request->session()->get('active_module');

        if (is_string($activeModule) && $this->moduleAccess->canAccessModule($user, $activeModule)) {
            return redirect()->route($this->moduleAccess->dashboardRouteForModule($user, $activeModule));
        }

        $request->session()->forget('active_module');

        try {
            return redirect()->route($this->moduleAccess->defaultDashboardRoute($user));
        } catch (\InvalidArgumentException) {
            abort(403, 'No dashboard available for your role.');
        }
    }

    public function libraryAdmin(): Response
    {
        $latestLoanIds = DB::table('library_book_logs')
            ->selectRaw('MAX(id) as id')
            ->groupBy('book_id');

        $navigationCounts = $this->libraryNavigationStatus->counts();

        return Inertia::render('Dashboard/LibraryAdmin', [
            'stats' => [
                'studentsCount' => LibraryStudent::count(),
                'employeesCount' => LibraryEmployee::count(),
                'booksCount' => LibraryBook::count(),
                'pendingCount' => $navigationCounts['pendingPatrons'],
                'outstandingFinesCount' => $navigationCounts['outstandingFines'],
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
