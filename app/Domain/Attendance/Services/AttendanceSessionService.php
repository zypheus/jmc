<?php

namespace App\Domain\Attendance\Services;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendanceLog;
use App\Domain\Attendance\Models\AttendanceStudent;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AttendanceSessionService
{
    public const TZ = 'Asia/Manila';

    public function isInStatus(?string $status): bool
    {
        return $status !== null && strtolower(trim((string) $status)) === 'in';
    }

    public function isOutStatus(?string $status): bool
    {
        return $status !== null && strtolower(trim((string) $status)) === 'out';
    }

    public function closeStaleOpenInForStudent(AttendanceStudent $student): bool
    {
        return $this->closeStaleOpenIn('student_id', $student->id);
    }

    public function closeStaleOpenInForEmployee(AttendanceEmployee $employee): bool
    {
        return $this->closeStaleOpenIn('employee_id', $employee->id);
    }

    public function lastLogForStudent(AttendanceStudent $student): ?AttendanceLog
    {
        return $this->lastLog('student_id', $student->id);
    }

    public function lastLogForEmployee(AttendanceEmployee $employee): ?AttendanceLog
    {
        return $this->lastLog('employee_id', $employee->id);
    }

    public function nextStatus(?AttendanceLog $lastLog): string
    {
        return ($lastLog && $this->isInStatus($lastLog->status)) ? 'OUT' : 'IN';
    }

    public function closeAllStaleOpenIns(): int
    {
        if (! Schema::hasTable('attendance_logs')) {
            return 0;
        }

        $today = Carbon::now(self::TZ)->toDateString();
        $closed = 0;

        foreach (['student_id', 'employee_id'] as $column) {
            $stalePatronIds = DB::table('attendance_logs as al')
                ->join(DB::raw("(
                    SELECT {$column}, MAX(id) AS max_id
                    FROM attendance_logs
                    WHERE {$column} IS NOT NULL
                    GROUP BY {$column}
                ) AS last"), 'last.max_id', '=', 'al.id')
                ->whereRaw("LOWER(TRIM(al.status)) = 'in'")
                ->whereRaw('DATE(al.scanned_at) < ?', [$today])
                ->pluck("al.{$column}");

            foreach ($stalePatronIds as $patronId) {
                if ($this->closeStaleOpenIn($column, (int) $patronId)) {
                    $closed++;
                }
            }
        }

        return $closed;
    }

    private function lastLog(string $column, int $patronId): ?AttendanceLog
    {
        return AttendanceLog::query()
            ->where($column, $patronId)
            ->orderByDesc('scanned_at')
            ->orderByDesc('id')
            ->first();
    }

    private function closeStaleOpenIn(string $column, int $patronId): bool
    {
        $last = $this->lastLog($column, $patronId);

        if (! $last || ! $this->isInStatus($last->status)) {
            return false;
        }

        $inDayStart = Carbon::parse($last->scanned_at)->timezone(self::TZ)->startOfDay();
        $todayStart = Carbon::now(self::TZ)->startOfDay();

        if ($inDayStart->greaterThanOrEqualTo($todayStart)) {
            return false;
        }

        $outAt = Carbon::parse($last->scanned_at)->timezone(self::TZ)->endOfDay();

        AttendanceLog::create([
            $column => $patronId,
            'status' => 'OUT',
            'scanned_at' => $outAt,
        ]);

        return true;
    }
}
