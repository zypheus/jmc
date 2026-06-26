<?php

namespace App\Http\Controllers\Attendance;

use App\Domain\Attendance\Exports\AttendanceLogsExport;
use App\Domain\Attendance\Models\AttendanceLog;
use App\Domain\Attendance\Models\AttendanceSetting;
use App\Domain\Attendance\Models\AttendanceStudent;
use App\Domain\Attendance\Services\PatronAttendanceReportService;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = $this->filteredLogs($request)
            ->paginate(10)
            ->withQueryString();

        $courses = Cache::remember('attendance.student_courses', 600, fn () => AttendanceStudent::query()
            ->select('course')
            ->whereNotNull('course')
            ->distinct()
            ->orderBy('course')
            ->pluck('course')
        );

        $sections = Cache::remember('attendance.sections', 600, fn () => AttendanceSetting::attendanceSections()
        );

        return Inertia::render('Attendance/Logs/Index', [
            'logs' => $logs,
            'courses' => $courses,
            'sections' => $sections,
            'filters' => $request->only(['from', 'to', 'section', 'year_level', 'course', 'status', 'search', 'patron_type']),
        ]);
    }

    private function filteredLogs(Request $request)
    {
        return AttendanceLog::query()
            ->with(['student', 'employee'])
            ->when($request->from, fn ($q) => $q->whereDate('scanned_at', '>=', $request->from))
            ->when($request->to, fn ($q) => $q->whereDate('scanned_at', '<=', $request->to))
            ->when($request->section, fn ($q) => $q->where('section', $request->section))
            ->when($request->patron_type === 'student', fn ($q) => $q->whereNotNull('student_id'))
            ->when($request->patron_type === 'employee', fn ($q) => $q->whereNotNull('employee_id'))
            ->when($request->year_level, fn ($q) => $q->whereHas('student', fn ($q2) => $q2->where('year', $request->year_level)))
            ->when($request->course, fn ($q) => $q->whereHas('student', fn ($q2) => $q2->where('course', $request->course)))
            ->when($request->status, fn ($q) => $q->where('status', strtoupper((string) $request->status)))
            ->when($request->search, function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $query->where('section', 'like', "%{$search}%")
                        ->orWhereHas('student', function ($q2) use ($search) {
                            $q2->where('firstname', 'like', "%{$search}%")
                                ->orWhere('lastname', 'like', "%{$search}%")
                                ->orWhere('course', 'like', "%{$search}%");
                        })
                        ->orWhereHas('employee', function ($q2) use ($search) {
                            $q2->where('firstname', 'like', "%{$search}%")
                                ->orWhere('lastname', 'like', "%{$search}%")
                                ->orWhere('department', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('scanned_at');
    }

    public function exportPdf(Request $request)
    {
        $logs = $this->filteredLogs($request)->get();
        $pdf = Pdf::loadView('attendance.logs-pdf', compact('logs'));

        return $pdf->download('attendance_logs.pdf');
    }

    public function exportExcel(Request $request)
    {
        $logs = $this->filteredLogs($request)->get();

        return Excel::download(new AttendanceLogsExport($logs), 'attendance_logs.xlsx');
    }

    public function reportsHub(): Response
    {
        return Inertia::render('Attendance/Reports/Hub');
    }

    public function reportsDashboard(Request $request, PatronAttendanceReportService $patronReports): Response
    {
        $from = $request->query('from');
        $to = $request->query('to');
        $only = $request->query('only');

        return Inertia::render('Attendance/Reports/Dashboard', array_merge(
            compact('from', 'to', 'only'),
            $patronReports->build($from, $to)
        ));
    }

    public function reportsExportCsv(Request $request, PatronAttendanceReportService $patronReports)
    {
        return $patronReports->streamCsvResponse(
            $request->query('from'),
            $request->query('to')
        );
    }
}
