<?php

namespace App\Domain\Library\Support;

use App\Domain\Attendance\Support\PatronNameNormalizer;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryStudent;

class LibraryAttendancePatronResolver
{
    /**
     * @return array{type: 'student'|'employee', patron: LibraryStudent|LibraryEmployee}|null
     */
    public function resolve(string $raw): ?array
    {
        $token = trim(str_replace("\r", '', $raw));

        $student = LibraryStudent::query()->where('qrcode', $token)->first();
        if ($student) {
            return ['type' => 'student', 'patron' => $student];
        }

        $employee = LibraryEmployee::query()->where('qrcode', $token)->first();
        if ($employee) {
            return ['type' => 'employee', 'patron' => $employee];
        }

        $parsed = $this->parseQr($raw);

        if ($parsed['id_number']) {
            $student = LibraryStudent::query()
                ->where('id_number', $parsed['id_number'])
                ->first();

            if ($student) {
                return ['type' => 'student', 'patron' => $student];
            }

            $employee = LibraryEmployee::query()
                ->where('employee_id', $parsed['id_number'])
                ->first();

            if ($employee) {
                return ['type' => 'employee', 'patron' => $employee];
            }
        }

        if ($parsed['full_name']) {
            $qrName = PatronNameNormalizer::normalizeFullName($parsed['full_name']);

            $student = LibraryStudent::query()
                ->get()
                ->first(fn (LibraryStudent $student) => PatronNameNormalizer::normalizeFullName(
                    trim($student->firstname.' '.$student->lastname)
                ) === $qrName);

            if ($student) {
                return ['type' => 'student', 'patron' => $student];
            }
        }

        return null;
    }

    /**
     * @return array{id_number: ?string, full_name: ?string, course: ?string}
     */
    private function parseQr(string $raw): array
    {
        $raw = trim(str_replace("\r", '', $raw));

        if (str_contains($raw, "\n")) {
            $lines = array_values(array_filter(array_map('trim', explode("\n", $raw))));

            return [
                'id_number' => $lines[0] ?? null,
                'full_name' => $lines[1] ?? null,
                'course' => $lines[2] ?? null,
            ];
        }

        $parts = array_map('trim', explode(',', $raw));

        if (preg_match('/^\d{2}-\d+$/', $parts[0] ?? '')) {
            return [
                'id_number' => $parts[0] ?? null,
                'full_name' => $parts[1] ?? null,
                'course' => $parts[2] ?? null,
            ];
        }

        return [
            'id_number' => null,
            'full_name' => $parts[0] ?? null,
            'course' => $parts[1] ?? null,
        ];
    }
}
