<?php

namespace Database\Seeders;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendanceLog;
use App\Domain\Attendance\Models\AttendanceSetting;
use App\Domain\Attendance\Models\AttendanceStudent;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceLogSampleSeeder extends Seeder
{
    private const TZ = 'Asia/Manila';

    public function run(): void
    {
        $sections = AttendanceSetting::attendanceSections();
        $students = AttendanceStudent::query()
            ->whereIn('qrcode', ['AS-00000001', 'AS-00000002', 'AS-00000003', 'AS-00000004', 'AS-00000005'])
            ->orderBy('qrcode')
            ->get();
        $employees = AttendanceEmployee::query()
            ->whereIn('qrcode', ['AE-00000001', 'AE-00000002'])
            ->orderBy('qrcode')
            ->get();

        if ($students->isEmpty()) {
            return;
        }

        $visitPatterns = [
            [0, 1, 2, 3, 4],
            [0, 2, 4],
            [1, 3, 5, 6, 7],
            [0, 1, 4, 5],
            [2, 3, 6, 7],
        ];

        $today = Carbon::now(self::TZ)->startOfDay();

        foreach ($students as $index => $student) {
            foreach ($visitPatterns[$index] ?? [0, 2, 4] as $dayOffset => $daysAgo) {
                $day = $today->copy()->subDays($daysAgo);
                $section = $sections[($index + $dayOffset) % count($sections)] ?? null;
                $inAt = $day->copy()->setTime(8 + ($index % 3), 10 * ($dayOffset % 6));
                $outAt = $day->copy()->setTime(15 + ($index % 3), 5 + (10 * ($dayOffset % 5)));

                $this->upsertLog((int) $student->id, null, 'IN', $inAt, $section);
                $this->upsertLog((int) $student->id, null, 'OUT', $outAt, $section);
            }
        }

        foreach ($employees as $index => $employee) {
            for ($daysAgo = 0; $daysAgo < 3; $daysAgo++) {
                $day = $today->copy()->subDays($daysAgo);
                $section = $sections[($index + $daysAgo + 2) % count($sections)] ?? null;
                $inAt = $day->copy()->setTime(7 + $index, 30);
                $outAt = $day->copy()->setTime(17 + $index, 15);

                $this->upsertLog(null, (int) $employee->id, 'IN', $inAt, $section);
                $this->upsertLog(null, (int) $employee->id, 'OUT', $outAt, $section);
            }
        }
    }

    private function upsertLog(?int $studentId, ?int $employeeId, string $status, Carbon $scannedAt, ?string $section): void
    {
        AttendanceLog::query()->updateOrCreate(
            [
                'student_id' => $studentId,
                'employee_id' => $employeeId,
                'status' => $status,
                'scanned_at' => $scannedAt,
            ],
            ['section' => $section]
        );
    }
}
