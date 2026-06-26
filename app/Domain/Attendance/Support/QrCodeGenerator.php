<?php

namespace App\Domain\Attendance\Support;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendanceStudent;

class QrCodeGenerator
{
    public static function nextStudentCode(): string
    {
        $last = AttendanceStudent::query()->orderByDesc('id')->first();
        $nextNumber = 1;

        if ($last && $last->qrcode && str_starts_with((string) $last->qrcode, 'S-')) {
            $nextNumber = (int) substr((string) $last->qrcode, 2) + 1;
        }

        return 'S-'.str_pad((string) $nextNumber, 8, '0', STR_PAD_LEFT);
    }

    public static function nextEmployeeCode(): string
    {
        $last = AttendanceEmployee::query()->orderByDesc('id')->first();
        $nextNumber = 1;

        if ($last && $last->qrcode && str_starts_with((string) $last->qrcode, 'E-')) {
            $nextNumber = (int) substr((string) $last->qrcode, 2) + 1;
        }

        return 'E-'.str_pad((string) $nextNumber, 8, '0', STR_PAD_LEFT);
    }
}
