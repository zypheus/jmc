<?php

namespace Database\Seeders;

use App\Domain\Attendance\Models\AttendanceSetting;
use Illuminate\Database\Seeder;

class AttendanceSettingsSeeder extends Seeder
{
    public function run(): void
    {
        AttendanceSetting::setAttendanceSections(AttendanceSetting::DEFAULT_ATTENDANCE_SECTIONS);
        AttendanceSetting::setScanSmsTemplate('Hello {name}, you scanned {status} at {section} on {time}.');
        AttendanceSetting::setLogoutFeedbackEnabled(true);
        AttendanceSetting::setSectionPickerEnabled(true);
    }
}
