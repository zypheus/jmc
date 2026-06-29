<?php

namespace App\Http\Controllers\Attendance;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendanceSetting;
use App\Domain\Attendance\Models\AttendanceStudent;
use App\Domain\Attendance\Services\AttendanceSessionService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\SendSmsBlastRequest;
use App\Http\Requests\Attendance\UpdateScanSmsRequest;
use App\Services\Shared\SmsModemService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SmsController extends Controller
{
    public function __construct(private readonly SmsModemService $smsModem) {}

    public function index(): Response
    {
        $courses = AttendanceStudent::query()
            ->select('course')
            ->whereNotNull('course')
            ->distinct()
            ->orderBy('course')
            ->pluck('course');

        return Inertia::render('Attendance/Sms/Blast', [
            'courses' => $courses,
        ]);
    }

    public function scanMessage(): Response
    {
        return Inertia::render('Attendance/Sms/ScanMessage', [
            'message' => AttendanceSetting::scanSmsTemplate(),
        ]);
    }

    public function updateScanMessage(UpdateScanSmsRequest $request)
    {
        AttendanceSetting::setScanSmsTemplate($request->validated('message'));

        return back()->with('success', 'Scan SMS updated.');
    }

    public function count(Request $request)
    {
        return response()->json(['count' => $this->recipientQuery($request)->count()]);
    }

    public function send(SendSmsBlastRequest $request)
    {
        $students = $this->recipientQuery($request)->get();
        $payload = [];

        foreach ($students as $student) {
            $message = str_replace('{name}', $student->full_name, $request->validated('message'));
            $number = $this->smsModem->normalizePhilippineMobile((string) $student->mobile_number);

            if ($number === '') {
                continue;
            }

            $payload[] = ['number' => $number, 'message' => $message];
        }

        if ($payload !== []) {
            $this->postToModem($payload);
        }

        return back()->with('success', 'SMS sent successfully.');
    }

    public function sendScanNotification(AttendanceStudent|AttendanceEmployee $patron, string $status): bool
    {
        $mobile = $patron instanceof AttendanceStudent
            ? $patron->mobile_number
            : $patron->emergency_contact_number;

        if (empty($mobile)) {
            return false;
        }

        $message = str_replace(
            ['{name}', '{status}', '{time}'],
            [
                $patron->full_name,
                $status,
                Carbon::now(AttendanceSessionService::TZ)->format('h:i A'),
            ],
            AttendanceSetting::scanSmsTemplate()
        );

        return $this->sendDirect((string) $mobile, $message);
    }

    public function sendDirect(string $number, string $message): bool
    {
        $number = $this->smsModem->normalizePhilippineMobile($number);

        if ($number === '') {
            return false;
        }

        return $this->postToModem([['number' => $number, 'message' => $message]]);
    }

    /** @param  list<array{number: string, message: string}>  $payload */
    private function postToModem(array $payload): bool
    {
        return $this->smsModem->send($payload)?->successful() ?? false;
    }

    private function recipientQuery(Request $request): Builder
    {
        $query = AttendanceStudent::query()
            ->whereNotNull('mobile_number')
            ->where('mobile_number', '!=', '');

        if ($request->filled('year')) {
            $query->where('year', $request->string('year')->toString());
        }

        if ($request->filled('course')) {
            $query->where('course', $request->string('course')->toString());
        }

        return $query;
    }
}
