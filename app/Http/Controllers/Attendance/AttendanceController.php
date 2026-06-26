<?php

namespace App\Http\Controllers\Attendance;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendanceLog;
use App\Domain\Attendance\Models\AttendanceSetting;
use App\Domain\Attendance\Models\AttendanceStudent;
use App\Domain\Attendance\Services\AttendanceSessionService;
use App\Domain\Attendance\Support\AttendancePatronResolver;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\ProcessSectionRequest;
use App\Http\Requests\Attendance\ScanAttendanceRequest;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function showScanner(): Response
    {
        return Inertia::render('Attendance/Scan', [
            'logoutFeedbackEnabled' => AttendanceSetting::logoutFeedbackEnabled(),
            'sectionPickerEnabled' => AttendanceSetting::sectionPickerEnabled(),
            'attendanceSections' => AttendanceSetting::attendanceSections(),
        ]);
    }

    public function scan(
        ScanAttendanceRequest $request,
        AttendancePatronResolver $resolver,
        AttendanceSessionService $sessions,
    ) {
        $resolved = $resolver->resolve($request->validated('qrcode'));

        if (! $resolved) {
            return response()->json([
                'type' => 'error',
                'message' => 'RFID or QR code not recognized.',
            ]);
        }

        $type = $resolved['type'];
        $patron = $resolved['patron'];

        if ($type === 'student') {
            /** @var AttendanceStudent $patron */
            $sessions->closeStaleOpenInForStudent($patron);
            $lastLog = $sessions->lastLogForStudent($patron);
        } else {
            /** @var AttendanceEmployee $patron */
            $sessions->closeStaleOpenInForEmployee($patron);
            $lastLog = $sessions->lastLogForEmployee($patron);
        }

        $nextStatus = $sessions->nextStatus($lastLog);

        return response()->json([
            'type' => $type,
            'next_status' => $nextStatus,
            'patron_type' => $type,
            'patron_id' => $patron->id,
            'student_id' => $type === 'student' ? $patron->id : null,
            'employee_id' => $type === 'employee' ? $patron->id : null,
            'logout_feedback_enabled' => AttendanceSetting::logoutFeedbackEnabled(),
            'section_picker_enabled' => AttendanceSetting::sectionPickerEnabled(),
            'patron' => [
                'id' => $patron->id,
                'firstname' => $patron->firstname,
                'lastname' => $patron->lastname,
                'profile_picture' => $patron->profile_picture_path,
            ],
        ]);
    }

    public function processSection(
        ProcessSectionRequest $request,
        AttendanceSessionService $sessions,
        SmsController $smsController,
    ) {
        $validated = $request->validated();
        $section = isset($validated['section']) ? trim((string) $validated['section']) : null;

        if ($section !== null && $section !== '') {
            $allowed = AttendanceSetting::attendanceSections();
            if (! in_array($section, $allowed, true)) {
                return response()->json(['message' => 'Invalid section selected.'], 422);
            }
        } else {
            $section = null;
        }

        $patronType = $validated['patron_type'];
        $patronId = (int) $validated['patron_id'];

        if ($patronType === 'student') {
            $patron = AttendanceStudent::query()->findOrFail($patronId);
            $sessions->closeStaleOpenInForStudent($patron);
            $lastLog = $sessions->lastLogForStudent($patron);
            $logAttributes = ['student_id' => $patron->id];
        } else {
            $patron = AttendanceEmployee::query()->findOrFail($patronId);
            $sessions->closeStaleOpenInForEmployee($patron);
            $lastLog = $sessions->lastLogForEmployee($patron);
            $logAttributes = ['employee_id' => $patron->id];
        }

        $newStatus = $sessions->nextStatus($lastLog);

        $log = AttendanceLog::create(array_merge($logAttributes, [
            'section' => $section,
            'status' => $newStatus,
            'scanned_at' => now(),
        ]));

        $smsController->sendScanNotification($patron, $newStatus);

        return response()->json([
            'status' => $newStatus,
            'patron_type' => $patronType,
            'scanned_at' => $log->scanned_at->format('Y-m-d h:i:s A'),
            'logout_feedback_enabled' => AttendanceSetting::logoutFeedbackEnabled(),
        ]);
    }
}
