<?php

namespace App\Domain\Library\Services;

use App\Domain\Library\Models\LibraryAttendanceLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LibraryAttendanceReportService
{
    protected function normalizeDateRange(?string $from, ?string $to): array
    {
        $tz = LibraryAttendanceSessionService::TZ;

        try {
            $fromDt = $from ? Carbon::parse($from, $tz)->startOfDay() : null;
        } catch (\Throwable) {
            $fromDt = null;
        }

        try {
            $toDt = $to ? Carbon::parse($to, $tz)->endOfDay() : null;
        } catch (\Throwable) {
            $toDt = null;
        }

        if ($fromDt && $toDt && $fromDt->greaterThan($toDt)) {
            [$fromDt, $toDt] = [$toDt->copy()->startOfDay(), $fromDt->copy()->endOfDay()];
        }

        return [
            $fromDt?->toDateTimeString(),
            $toDt?->toDateTimeString(),
        ];
    }

    public function build(?string $from = null, ?string $to = null): array
    {
        $empty = [
            'topStudentsByIns' => collect(),
            'topStudentsByDistinctInDays' => collect(),
            'programAttendanceTotals' => collect(),
            'weeklyInsTrend' => collect(),
            'monthlyInsTrend' => collect(),
            'busiestHours' => collect(),
        ];

        if (! Schema::hasTable('library_attendance_logs')) {
            return $empty;
        }

        [$fromDt, $toDt] = $this->normalizeDateRange($from, $to);
        $inExpr = "LOWER(TRIM(library_attendance_logs.status)) = 'in'";

        $topStudentsByIns = DB::table('library_attendance_logs')
            ->join('library_students', 'library_students.id', '=', 'library_attendance_logs.student_id')
            ->whereRaw($inExpr)
            ->when($fromDt && $toDt, fn ($q) => $q->whereBetween('library_attendance_logs.scanned_at', [$fromDt, $toDt]))
            ->select(
                'library_students.id',
                'library_students.lastname',
                'library_students.firstname',
                'library_students.course',
                DB::raw('COUNT(*) as ins_count')
            )
            ->groupBy('library_students.id', 'library_students.lastname', 'library_students.firstname', 'library_students.course')
            ->orderByDesc('ins_count')
            ->limit(10)
            ->get();

        $topStudentsByDistinctInDays = DB::table('library_attendance_logs')
            ->join('library_students', 'library_students.id', '=', 'library_attendance_logs.student_id')
            ->whereRaw($inExpr)
            ->when($fromDt && $toDt, fn ($q) => $q->whereBetween('library_attendance_logs.scanned_at', [$fromDt, $toDt]))
            ->select(
                'library_students.id',
                'library_students.lastname',
                'library_students.firstname',
                'library_students.course',
                DB::raw('COUNT(DISTINCT DATE(library_attendance_logs.scanned_at)) as distinct_in_days')
            )
            ->groupBy('library_students.id', 'library_students.lastname', 'library_students.firstname', 'library_students.course')
            ->orderByDesc('distinct_in_days')
            ->limit(10)
            ->get();

        $registeredByCourse = DB::table('library_students')
            ->whereNotNull('course')
            ->where('course', '!=', '')
            ->select('course', DB::raw('COUNT(*) as student_count'))
            ->groupBy('course')
            ->get()
            ->keyBy('course');

        $insByCourse = DB::table('library_attendance_logs')
            ->join('library_students', 'library_students.id', '=', 'library_attendance_logs.student_id')
            ->whereRaw($inExpr)
            ->when($fromDt && $toDt, fn ($q) => $q->whereBetween('library_attendance_logs.scanned_at', [$fromDt, $toDt]))
            ->whereNotNull('library_students.course')
            ->where('library_students.course', '!=', '')
            ->select('library_students.course', DB::raw('COUNT(*) as ins_count'))
            ->groupBy('library_students.course')
            ->get()
            ->keyBy('course');

        $codes = $registeredByCourse->keys()->merge($insByCourse->keys())->unique()->sort()->values();

        $programAttendanceTotals = $codes->map(function ($code) use ($registeredByCourse, $insByCourse) {
            $studentCount = (int) ($registeredByCourse->get($code)->student_count ?? 0);
            $inCount = (int) ($insByCourse->get($code)->ins_count ?? 0);

            return (object) [
                'course' => $code,
                'student_count' => $studentCount,
                'ins_count' => $inCount,
                'avg_ins_per_student' => $studentCount > 0 ? round($inCount / $studentCount, 2) : 0.0,
            ];
        })->sortByDesc('ins_count')->values();

        $weeklyInsTrend = $this->trendByWeek($fromDt, $toDt);
        $monthlyInsTrend = $this->trendByMonth($fromDt, $toDt);
        $busiestHours = $this->busiestHours($fromDt, $toDt, $inExpr);

        return compact(
            'topStudentsByIns',
            'topStudentsByDistinctInDays',
            'programAttendanceTotals',
            'weeklyInsTrend',
            'monthlyInsTrend',
            'busiestHours'
        );
    }

    private function trendByWeek(?string $fromDt, ?string $toDt)
    {
        $tz = LibraryAttendanceSessionService::TZ;
        $trend = collect();

        if ($fromDt && $toDt) {
            $cursor = Carbon::parse($fromDt, $tz)->startOfWeek(Carbon::MONDAY);
            $endCursor = Carbon::parse($toDt, $tz)->endOfWeek(Carbon::SUNDAY)->endOfDay();
            while ($cursor->lte($endCursor)) {
                $start = $cursor->copy()->startOfWeek(Carbon::MONDAY);
                $end = $cursor->copy()->endOfWeek(Carbon::SUNDAY)->endOfDay();
                $trend->push((object) [
                    'label' => $start->format('M j').' - '.$end->format('M j, Y'),
                    'count' => LibraryAttendanceLog::query()
                        ->whereRaw("LOWER(TRIM(status)) = 'in'")
                        ->whereBetween('scanned_at', [max($start->toDateTimeString(), $fromDt), min($end->toDateTimeString(), $toDt)])
                        ->count(),
                ]);
                $cursor->addWeek();
            }

            return $trend;
        }

        for ($i = 11; $i >= 0; $i--) {
            $start = Carbon::now($tz)->subWeeks($i)->startOfWeek(Carbon::MONDAY);
            $end = $start->copy()->endOfWeek(Carbon::SUNDAY)->endOfDay();
            $trend->push((object) [
                'label' => $start->format('M j').' - '.$end->format('M j, Y'),
                'count' => LibraryAttendanceLog::query()
                    ->whereRaw("LOWER(TRIM(status)) = 'in'")
                    ->whereBetween('scanned_at', [$start->toDateTimeString(), $end->toDateTimeString()])
                    ->count(),
            ]);
        }

        return $trend;
    }

    private function trendByMonth(?string $fromDt, ?string $toDt)
    {
        $tz = LibraryAttendanceSessionService::TZ;
        $trend = collect();

        if ($fromDt && $toDt) {
            $cursor = Carbon::parse($fromDt, $tz)->startOfMonth();
            $endCursor = Carbon::parse($toDt, $tz)->endOfMonth()->endOfDay();
            while ($cursor->lte($endCursor)) {
                $start = $cursor->copy()->startOfMonth();
                $end = $cursor->copy()->endOfMonth()->endOfDay();
                $trend->push((object) [
                    'label' => $start->format('F Y'),
                    'count' => LibraryAttendanceLog::query()
                        ->whereRaw("LOWER(TRIM(status)) = 'in'")
                        ->whereBetween('scanned_at', [max($start->toDateTimeString(), $fromDt), min($end->toDateTimeString(), $toDt)])
                        ->count(),
                ]);
                $cursor->addMonth();
            }

            return $trend;
        }

        for ($i = 11; $i >= 0; $i--) {
            $start = Carbon::now($tz)->subMonths($i)->startOfMonth();
            $end = $start->copy()->endOfMonth()->endOfDay();
            $trend->push((object) [
                'label' => $start->format('F Y'),
                'count' => LibraryAttendanceLog::query()
                    ->whereRaw("LOWER(TRIM(status)) = 'in'")
                    ->whereBetween('scanned_at', [$start->toDateTimeString(), $end->toDateTimeString()])
                    ->count(),
            ]);
        }

        return $trend;
    }

    private function busiestHours(?string $fromDt, ?string $toDt, string $inExpr)
    {
        $rows = DB::table('library_attendance_logs')
            ->whereRaw($inExpr)
            ->when($fromDt && $toDt, fn ($q) => $q->whereBetween('library_attendance_logs.scanned_at', [$fromDt, $toDt]))
            ->pluck('scanned_at');

        $hourRows = $rows
            ->map(fn ($scannedAt) => Carbon::parse($scannedAt, LibraryAttendanceSessionService::TZ)->hour)
            ->countBy();

        return collect(range(0, 23))->map(function ($hour) use ($hourRows) {
            return (object) [
                'hour' => $hour,
                'label' => sprintf('%02d:00-%02d:59', $hour, $hour),
                'count' => (int) ($hourRows->get($hour) ?? 0),
            ];
        })->sortByDesc('count')->values();
    }

    public function streamCsvResponse(?string $from = null, ?string $to = null): StreamedResponse
    {
        $reports = $this->build($from, $to);
        $filename = 'library-attendance-reports-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($reports) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");

            $write = static function (array $row) use ($out): void {
                fputcsv($out, $row);
            };

            $write(['Library attendance reports', 'Exported at', now()->timezone(LibraryAttendanceSessionService::TZ)->format('Y-m-d H:i')]);
            $write([]);

            $write(['# TOP 10 - MOST IN SCANS']);
            $write(['Rank', 'Last name', 'First name', 'Course', 'IN count']);
            foreach ($reports['topStudentsByIns'] as $index => $row) {
                $write([$index + 1, $row->lastname, $row->firstname, $row->course ?? '', $row->ins_count]);
            }
            $write([]);

            $write(['# TOP 10 - DISTINCT DAYS WITH IN']);
            $write(['Rank', 'Last name', 'First name', 'Course', 'Distinct days']);
            foreach ($reports['topStudentsByDistinctInDays'] as $index => $row) {
                $write([$index + 1, $row->lastname, $row->firstname, $row->course ?? '', $row->distinct_in_days]);
            }
            $write([]);

            $write(['# TOTALS BY COURSE']);
            $write(['Course', 'Registered patrons', 'IN scans', 'Avg INs / patron']);
            foreach ($reports['programAttendanceTotals'] as $row) {
                $write([$row->course, $row->student_count, $row->ins_count, $row->avg_ins_per_student ?? 0]);
            }
            $write([]);

            $write(['# IN SCANS BY WEEK']);
            $write(['Week label', 'IN count']);
            foreach ($reports['weeklyInsTrend'] as $row) {
                $write([$row->label, $row->count]);
            }
            $write([]);

            $write(['# IN SCANS BY MONTH']);
            $write(['Month', 'IN count']);
            foreach ($reports['monthlyInsTrend'] as $row) {
                $write([$row->label, $row->count]);
            }
            $write([]);

            $write(['# BUSIEST HOUR OF DAY']);
            $write(['Hour', 'IN count']);
            foreach ($reports['busiestHours'] as $row) {
                $write([$row->label, $row->count]);
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
