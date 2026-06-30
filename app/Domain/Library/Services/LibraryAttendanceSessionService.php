<?php

namespace App\Domain\Library\Services;

use App\Domain\Library\Models\LibraryAttendanceLog;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryStudent;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LibraryAttendanceSessionService
{
    public const TZ = 'Asia/Manila';

    public function isInStatus(?string $status): bool
    {
        return $status !== null && strtolower(trim((string) $status)) === 'in';
    }

    public function closeStaleOpenInForStudent(LibraryStudent $student): bool
    {
        return $this->closeStaleOpenIn('student_id', $student->id);
    }

    public function closeStaleOpenInForEmployee(LibraryEmployee $employee): bool
    {
        return $this->closeStaleOpenIn('employee_id', $employee->id);
    }

    public function lastLogForStudent(LibraryStudent $student): ?LibraryAttendanceLog
    {
        return $this->lastLog('student_id', $student->id);
    }

    public function lastLogForEmployee(LibraryEmployee $employee): ?LibraryAttendanceLog
    {
        return $this->lastLog('employee_id', $employee->id);
    }

    public function nextStatus(?LibraryAttendanceLog $lastLog): string
    {
        return ($lastLog && $this->isInStatus($lastLog->status)) ? 'OUT' : 'IN';
    }

    private function lastLog(string $column, int $patronId): ?LibraryAttendanceLog
    {
        return LibraryAttendanceLog::query()
            ->where($column, $patronId)
            ->orderByDesc('scanned_at')
            ->orderByDesc('id')
            ->first();
    }

    private function closeStaleOpenIn(string $column, int $patronId): bool
    {
        if (! Schema::hasTable('library_attendance_logs')) {
            return false;
        }

        $last = $this->lastLog($column, $patronId);

        if (! $last || ! $this->isInStatus($last->status)) {
            return false;
        }

        $inDayStart = Carbon::parse($last->scanned_at)->timezone(self::TZ)->startOfDay();
        $todayStart = Carbon::now(self::TZ)->startOfDay();

        if ($inDayStart->greaterThanOrEqualTo($todayStart)) {
            return false;
        }

        DB::table('library_attendance_logs')->insert([
            $column => $patronId,
            'status' => 'OUT',
            'scanned_at' => Carbon::parse($last->scanned_at)->timezone(self::TZ)->endOfDay()->toDateTimeString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return true;
    }
}
