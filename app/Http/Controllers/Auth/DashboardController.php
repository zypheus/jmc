<?php

namespace App\Http\Controllers\Auth;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendanceLog;
use App\Domain\Attendance\Models\AttendancePendingEmployee;
use App\Domain\Attendance\Models\AttendancePendingStudent;
use App\Domain\Attendance\Models\AttendanceStudent;
use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Services\LibraryNavigationStatusService;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\ModuleAccessService;
use Carbon\Carbon;
use Database\Seeders\RoleSeeder;
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
            $defaultModule = $this->moduleAccess->defaultModule($user);
            $request->session()->put('active_module', $defaultModule);

            return redirect()->route($this->moduleAccess->dashboardRouteForModule($user, $defaultModule));
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
        return Inertia::render('Dashboard/SuperAdmin', [
            'stats' => [
                'totalStaffCount' => User::query()->role(RoleSeeder::ROLES)->count(),
                'activeStaffCount' => User::query()->role(RoleSeeder::ROLES)->where('is_active', true)->count(),
                'inactiveStaffCount' => User::query()->role(RoleSeeder::ROLES)->where('is_active', false)->count(),
                'superAdminCount' => User::query()->role('super_admin')->count(),
                'libraryStaffCount' => User::query()->role(['library_admin', 'library_staff'])->count(),
                'attendanceStaffCount' => User::query()->role(['attendance_admin', 'attendance_staff'])->count(),
            ],
            'roleBreakdown' => [
                'super_admin' => User::query()->role('super_admin')->count(),
                'library_admin' => User::query()->role('library_admin')->count(),
                'library_staff' => User::query()->role('library_staff')->count(),
                'attendance_admin' => User::query()->role('attendance_admin')->count(),
                'attendance_staff' => User::query()->role('attendance_staff')->count(),
            ],
            'recentStaffActivity' => AdminActivity::query()
                ->where('type', AdminActivity::TYPE_USER)
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (AdminActivity $activity) => [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'body' => $activity->body,
                    'actionUrl' => $activity->action_url,
                    'createdAt' => $activity->created_at?->timezone('Asia/Manila')->diffForHumans(),
                ])
                ->values()
                ->all(),
        ]);
    }
}
