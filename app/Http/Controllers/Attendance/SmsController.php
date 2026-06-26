<?php

namespace App\Http\Controllers\Attendance;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendanceSetting;
use App\Domain\Attendance\Models\AttendanceStudent;
use App\Domain\Attendance\Services\AttendanceSessionService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\SendSmsBlastRequest;
use App\Http\Requests\Attendance\UpdateScanSmsRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class SmsController extends Controller
{
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
        $query = AttendanceStudent::query()->whereNotNull('mobile_number');

        if ($request->year) {
            $query->where('year', $request->year);
        }

        if ($request->course) {
            $query->where('course', $request->course);
        }

        return response()->json(['count' => $query->count()]);
    }

    public function send(SendSmsBlastRequest $request)
    {
        $students = AttendanceStudent::query()->whereNotNull('mobile_number')->get();
        $payload = [];

        foreach ($students as $student) {
            $message = str_replace('{name}', $student->full_name, $request->validated('message'));
            $number = $this->normalizePhilippineMobile((string) $student->mobile_number);

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
        $number = $this->normalizePhilippineMobile($number);

        if ($number === '') {
            return false;
        }

        return $this->postToModem([['number' => $number, 'message' => $message]]);
    }

    /** @param  list<array{number: string, message: string}>  $payload */
    private function postToModem(array $payload): bool
    {
        $url = config('services.sms_modem.url');
        $apiKey = config('services.sms_modem.key');

        if (! $url) {
            return false;
        }

        try {
            $response = Http::withHeaders(['X-API-KEY' => $apiKey])
                ->timeout(30)
                ->post($url, $payload);

            return $response->successful();
        } catch (\Throwable $e) {
            report($e);

            return false;
        }
    }

    private function normalizePhilippineMobile(string $number): string
    {
        $number = preg_replace('/\s+/', '', $number);

        if (str_starts_with($number, '0')) {
            return '+63'.substr($number, 1);
        }

        if (str_starts_with($number, '63')) {
            return '+'.$number;
        }

        return $number;
    }
}
