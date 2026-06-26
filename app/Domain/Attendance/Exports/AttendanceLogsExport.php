<?php

namespace App\Domain\Attendance\Exports;

use App\Domain\Attendance\Models\AttendanceStudent;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AttendanceLogsExport implements FromCollection, WithHeadings
{
    public function __construct(protected Collection $logs) {}

    public function collection(): Collection
    {
        return $this->logs->map(function ($log) {
            $patron = $log->patron();

            return [
                'patron_type' => $log->patronType() ?? 'unknown',
                'lastname' => $patron->lastname ?? 'Unknown',
                'firstname' => $patron->firstname ?? 'Unknown',
                'course_or_department' => $patron instanceof AttendanceStudent
                    ? ($patron->course ?? '—')
                    : ($patron->department ?? '—'),
                'section' => $log->section ?? '—',
                'status' => strtoupper((string) $log->status),
                'scanned_at' => $log->scanned_at?->format('Y-m-d h:i A') ?? '—',
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Patron Type',
            'Last Name',
            'First Name',
            'Course / Department',
            'Section',
            'Status',
            'Scanned At',
        ];
    }
}
