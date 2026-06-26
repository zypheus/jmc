<?php

namespace App\Domain\Attendance\Support;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendanceStudent;

class AttendancePatronResolver
{
    /**
     * @return array{type: 'student'|'employee', patron: AttendanceStudent|AttendanceEmployee}|null
     */
    public function resolve(string $raw): ?array
    {
        $token = trim(str_replace("\r", '', $raw));

        $student = AttendanceStudent::query()->where('qrcode', $token)->first();
        if ($student) {
            return ['type' => 'student', 'patron' => $student];
        }

        $employee = AttendanceEmployee::query()->where('qrcode', $token)->first();
        if ($employee) {
            return ['type' => 'employee', 'patron' => $employee];
        }

        $parsed = $this->parseQr($raw);

        if ($parsed['student_no']) {
            $student = AttendanceStudent::query()
                ->where('student_id', $parsed['student_no'])
                ->first();

            if ($student) {
                return ['type' => 'student', 'patron' => $student];
            }

            $employee = AttendanceEmployee::query()
                ->where(function ($query) use ($parsed) {
                    $query->where('employee_id', $parsed['student_no'])
                        ->orWhere('employee_number', $parsed['student_no']);
                })
                ->first();

            if ($employee) {
                return ['type' => 'employee', 'patron' => $employee];
            }
        }

        if ($parsed['full_name']) {
            $qrName = PatronNameNormalizer::normalizeFullName($parsed['full_name']);
            $student = AttendanceStudent::query()->where('normalized_name', $qrName)->first();

            if ($student) {
                return ['type' => 'student', 'patron' => $student];
            }
        }

        return null;
    }

    /**
     * @return array{student_no: ?string, full_name: ?string, course: ?string}
     */
    public function parseQr(string $raw): array
    {
        $raw = trim(str_replace("\r", '', $raw));

        if (str_contains($raw, "\n")) {
            $lines = array_values(array_filter(array_map('trim', explode("\n", $raw))));

            return [
                'student_no' => $lines[0] ?? null,
                'full_name' => $lines[1] ?? null,
                'course' => $lines[2] ?? null,
            ];
        }

        $parts = array_map('trim', explode(',', $raw));

        if (preg_match('/^\d{2}-\d+$/', $parts[0] ?? '')) {
            return [
                'student_no' => $parts[0] ?? null,
                'full_name' => $parts[1] ?? null,
                'course' => $parts[2] ?? null,
            ];
        }

        return [
            'student_no' => null,
            'full_name' => $parts[0] ?? null,
            'course' => $parts[1] ?? null,
        ];
    }
}
