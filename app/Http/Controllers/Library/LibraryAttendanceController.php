<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryAttendanceLog;
use App\Domain\Library\Models\LibraryAttendanceSetting;
use App\Domain\Library\Models\LibraryAttendanceVideo;
use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibrarySetting;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Services\LibraryAttendanceSessionService;
use App\Domain\Library\Support\LibraryAttendancePatronResolver;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\ScanAttendanceRequest;
use App\Http\Requests\Library\ProcessLibraryAttendanceRequest;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LibraryAttendanceController extends Controller
{
    public function showScanner(): Response
    {
        return Inertia::render('Attendance/Scan', [
            'logoutFeedbackEnabled' => LibraryAttendanceSetting::logoutFeedbackEnabled(),
            'sectionPickerEnabled' => false,
            'attendanceSections' => [],
            'attendanceVideoUrl' => LibraryAttendanceVideo::currentUrl(),
            'scanEndpoint' => route('library.attendance.scanner.process'),
            'sectionEndpoint' => route('library.attendance.scanner.section'),
            'feedbackEndpoint' => route('library.attendance.feedback.store'),
            'scannerTheme' => 'library',
        ]);
    }

    public function scan(
        ScanAttendanceRequest $request,
        LibraryAttendancePatronResolver $resolver,
        LibraryAttendanceSessionService $sessions,
    ) {
        $code = $request->validated('qrcode');
        $resolved = $resolver->resolve($code);

        if (! $resolved) {
            $book = LibraryBook::findByCopyIdentifier($code);

            if ($book) {
                $lastLog = LibraryBookLog::query()
                    ->where('book_id', $book->id)
                    ->latest()
                    ->first();

                $checkedOut = $lastLog && $lastLog->status === 'Checked Out';

                return response()->json([
                    'type' => 'book',
                    'book_status' => $checkedOut ? 'Properly Checked Out' : 'Not Checked Out',
                    'book' => [
                        'id' => $book->id,
                        'title_statement' => $book->title_statement,
                        'copy_identifier' => $book->copyIdentifierForCirculation(),
                        'copy_identifier_summary' => $book->copyIdentifierSummary(),
                    ],
                    'message' => $checkedOut
                        ? 'Book is properly checked out.'
                        : 'Book is not yet checked out!',
                ]);
            }

            return response()->json([
                'type' => 'error',
                'message' => 'Library ID, RFID, or QR code not recognized.',
            ]);
        }

        $type = $resolved['type'];
        $patron = $resolved['patron'];

        if ($type === 'student') {
            /** @var LibraryStudent $patron */
            $sessions->closeStaleOpenInForStudent($patron);
            $lastLog = $sessions->lastLogForStudent($patron);
        } else {
            /** @var LibraryEmployee $patron */
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
            'logout_feedback_enabled' => LibraryAttendanceSetting::logoutFeedbackEnabled(),
            'section_picker_enabled' => false,
            'patron' => [
                'id' => $patron->id,
                'firstname' => $patron->firstname,
                'lastname' => $patron->lastname,
                'profile_picture' => $this->profilePicturePath($patron),
            ],
        ]);
    }

    public function processSection(
        ProcessLibraryAttendanceRequest $request,
        LibraryAttendanceSessionService $sessions,
        SMSController $smsController,
    ) {
        $validated = $request->validated();
        $section = isset($validated['section']) ? trim((string) $validated['section']) : null;
        $section = $section !== '' ? $section : null;

        $patronType = $validated['patron_type'];
        $patronId = (int) $validated['patron_id'];

        if ($patronType === 'student') {
            $patron = LibraryStudent::query()->findOrFail($patronId);
            $sessions->closeStaleOpenInForStudent($patron);
            $lastLog = $sessions->lastLogForStudent($patron);
            $logAttributes = ['student_id' => $patron->id];
        } else {
            $patron = LibraryEmployee::query()->findOrFail($patronId);
            $sessions->closeStaleOpenInForEmployee($patron);
            $lastLog = $sessions->lastLogForEmployee($patron);
            $logAttributes = ['employee_id' => $patron->id];
        }

        $newStatus = $sessions->nextStatus($lastLog);

        $log = LibraryAttendanceLog::query()->create(array_merge($logAttributes, [
            'section' => $section,
            'status' => $newStatus,
            'scanned_at' => now(),
        ]));

        $this->sendScanNotification($smsController, $patron, $newStatus);

        return response()->json([
            'status' => $newStatus,
            'patron_type' => $patronType,
            'scanned_at' => $log->scanned_at->format('Y-m-d h:i:s A'),
            'logout_feedback_enabled' => LibraryAttendanceSetting::logoutFeedbackEnabled(),
        ]);
    }

    private function sendScanNotification(
        SMSController $smsController,
        LibraryStudent|LibraryEmployee $patron,
        string $status,
    ): bool {
        $mobile = $patron instanceof LibraryStudent
            ? $patron->mobile_number
            : $patron->emergency_contact_number;

        if (empty($mobile)) {
            return false;
        }

        $template = LibrarySetting::query()->where('key', 'scan_sms')->value('value')
            ?? 'Hello {name}, you scanned {status} at the library.';

        $message = str_replace(
            ['{name}', '{status}', '{time}'],
            [
                trim($patron->firstname.' '.$patron->lastname),
                $status,
                Carbon::now(LibraryAttendanceSessionService::TZ)->format('h:i A'),
            ],
            $template
        );

        return $smsController->sendDirect((string) $mobile, $message);
    }

    private function profilePicturePath(LibraryStudent|LibraryEmployee $patron): ?string
    {
        return $patron instanceof LibraryStudent
            ? $patron->profile_picture
            : $patron->formal_picture;
    }
}
