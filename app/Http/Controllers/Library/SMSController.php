<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibrarySetting;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Http\Controllers\Controller;
use App\Services\Shared\SmsModemService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Client\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SMSController extends Controller
{
    public function __construct(private readonly SmsModemService $smsModem) {}

    private function normalizePhilippineMobile(string $number): string
    {
        return $this->smsModem->normalizePhilippineMobile($number);
    }

    /**
     * POST JSON array to sms_server.py (SIM modem). Returns null if URL/API key missing.
     */
    private function postToSmsModem(array $payload): ?Response
    {
        return $this->smsModem->send($payload);
    }

    public function index(): InertiaResponse
    {
        $courses = LibraryStudent::query()
            ->select('course')
            ->whereNotNull('course')
            ->where('course', '!=', '')
            ->distinct()
            ->orderBy('course')
            ->pluck('course');

        $years = LibraryStudent::query()
            ->select('year')
            ->whereNotNull('year')
            ->where('year', '!=', '')
            ->distinct()
            ->orderBy('year')
            ->pluck('year');

        return Inertia::render('Library/Sms/Blast', [
            'courses' => $courses,
            'years' => $years,
        ]);
    }

    public function scanMessage(): InertiaResponse
    {
        $setting = LibrarySetting::where('key', 'scan_sms')->first();

        $todayManila = Carbon::now('Asia/Manila')->startOfDay();
        $overduePatronsWithMobile = LibraryStudent::query()
            ->whereNotNull('mobile_number')
            ->where('mobile_number', '!=', '')
            ->whereHas('bookLogs', function ($q) use ($todayManila) {
                $q->where('status', 'Checked Out')
                    ->whereNotNull('due_date')
                    ->whereDate('due_date', '<', $todayManila);
            })
            ->count();

        return Inertia::render('Library/Sms/ScanMessage', [
            'message' => $setting?->value ?? 'Hello {name}, you scanned {status} at the library.',
            'overduePatronsWithMobile' => $overduePatronsWithMobile,
        ]);
    }

    public function updateScanMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        LibrarySetting::updateOrCreate(
            ['key' => 'scan_sms'],
            ['value' => $request->message]
        );

        AdminActivityLogger::staff(
            AdminActivity::TYPE_SMS,
            'Scan SMS template updated',
            null,
            route('library.sms.page'),
            'library_staff',
        );

        return back()->with('success', 'Scan SMS template saved.');
    }

    public function count(Request $request)
    {
        return response()->json([
            'count' => $this->recipientQuery($request)->count(),
        ]);
    }

    /**
     * Single-number send (RFID scanner) or blast to filtered students.
     */
    public function send(Request $request)
    {
        if ($request->filled('number')) {
            $request->validate([
                'number' => 'required|string',
                'message' => 'required|string',
            ]);

            $number = $this->normalizePhilippineMobile($request->number);
            if ($number === '') {
                return back()->with('error', 'Invalid phone number.');
            }

            $modemResponse = $this->postToSmsModem([
                ['number' => $number, 'message' => $request->message],
            ]);

            if ($modemResponse === null) {
                return back()->with('error', 'SMS modem is not configured. Set SMS_MODEM_URL and SMS_MODEM_API_KEY in .env.');
            }

            if (! $modemResponse->successful()) {
                \Log::warning('SMS modem single send failed', [
                    'status' => $modemResponse->status(),
                ]);

                return back()->with('error', 'SMS modem rejected the request. Check logs and that sms_server.py is running.');
            }

            AdminActivityLogger::staff(
                AdminActivity::TYPE_SMS,
                'SMS sent',
                'Single message',
                route('library.sms.page'),
                'library_staff',
            );

            return back()->with('success', 'SMS queued for sending.');
        }

        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $students = $this->recipientQuery($request)->get();

        if ($students->isEmpty()) {
            return back()->with('error', 'No students with mobile numbers match the selected filters.');
        }

        $payload = [];
        $skipped = 0;

        foreach ($students as $student) {
            $name = trim($student->firstname.' '.$student->lastname);
            $body = str_replace('{name}', $name, $request->message);

            $number = $this->normalizePhilippineMobile((string) $student->mobile_number);
            if ($number === '') {
                $skipped++;

                continue;
            }

            $payload[] = [
                'number' => $number,
                'message' => $body,
            ];
        }

        if ($payload === []) {
            return back()->with('error', 'No valid mobile numbers to send to.'.($skipped > 0 ? " ({$skipped} skipped.)" : ''));
        }

        $modemResponse = $this->postToSmsModem($payload);

        if ($modemResponse === null) {
            return back()->with('error', 'SMS modem is not configured. Set SMS_MODEM_URL and SMS_MODEM_API_KEY in .env.');
        }

        if (! $modemResponse->successful()) {
            \Log::warning('SMS modem blast failed', [
                'status' => $modemResponse->status(),
            ]);

            return back()->with('error', 'SMS modem rejected the blast. Check logs and that sms_server.py is running.');
        }

        $msg = count($payload).' message(s) queued for sending via modem.';
        if ($skipped > 0) {
            $msg .= " {$skipped} student(s) skipped (no valid number).";
        }

        AdminActivityLogger::staff(
            AdminActivity::TYPE_SMS,
            'SMS blast sent',
            count($payload).' recipient(s)',
            route('library.sms.page'),
            'library_staff',
        );

        return back()->with('success', $msg);
    }

    /**
     * Active check-out loans past due date (Asia/Manila calendar day), excluding room use (no due date).
     */
    protected function overdueBookLogsForStudent(int $studentId): Collection
    {
        $todayManila = Carbon::now('Asia/Manila')->startOfDay();

        return LibraryBookLog::query()
            ->where('student_id', $studentId)
            ->where('status', 'Checked Out')
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', $todayManila)
            ->with('book')
            ->orderBy('due_date')
            ->get();
    }

    protected function replaceSmsPlaceholders(LibraryStudent $student, string $message, ?int $overdueCount = null, ?string $overdueTitles = null): string
    {
        $name = trim($student->firstname.' '.$student->lastname);
        $out = str_replace('{name}', $name, $message);
        if ($overdueCount !== null) {
            $out = str_replace('{count}', (string) $overdueCount, $out);
        }
        if ($overdueTitles !== null) {
            $out = str_replace('{titles}', $overdueTitles, $out);
        }

        return $out;
    }

    protected function modemFlashAfterPost(?Response $modemResponse, string $successMessage): RedirectResponse
    {
        if ($modemResponse === null) {
            return back()->with('error', 'SMS modem is not configured. Set SMS_MODEM_URL and SMS_MODEM_API_KEY in .env.');
        }

        if (! $modemResponse->successful()) {
            \Log::warning('SMS modem request failed', [
                'status' => $modemResponse->status(),
            ]);

            return back()->with('error', 'SMS modem rejected the request. Check logs and that sms_server.py is running.');
        }

        return back()->with('success', $successMessage);
    }

    public function sendOneStudent(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer|exists:library_students,id',
            'message' => 'required|string|max:2000',
        ]);

        $student = LibraryStudent::findOrFail($request->student_id);
        $number = $this->normalizePhilippineMobile((string) ($student->mobile_number ?? ''));
        if ($number === '') {
            return back()->with('error', 'This student has no mobile number on file.');
        }

        $body = $this->replaceSmsPlaceholders($student, $request->message);

        return $this->modemFlashAfterPost(
            $this->postToSmsModem([
                ['number' => $number, 'message' => $body],
            ]),
            'SMS queued for '.$student->lastname.', '.$student->firstname.'.'
        );
    }

    public function sendOverdue(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $students = LibraryStudent::query()
            ->whereNotNull('mobile_number')
            ->where('mobile_number', '!=', '')
            ->whereHas('bookLogs', function ($q) {
                $todayManila = Carbon::now('Asia/Manila')->startOfDay();
                $q->where('status', 'Checked Out')
                    ->whereNotNull('due_date')
                    ->whereDate('due_date', '<', $todayManila);
            })
            ->orderBy('lastname')
            ->orderBy('firstname')
            ->get();

        if ($students->isEmpty()) {
            return back()->with('error', 'No students with overdue books and a mobile number on file.');
        }

        $payload = [];
        $skipped = 0;

        foreach ($students as $student) {
            $logs = $this->overdueBookLogsForStudent((int) $student->id);
            if ($logs->isEmpty()) {
                continue;
            }

            $count = $logs->count();
            $titles = $logs->take(5)->map(fn (LibraryBookLog $l) => $l->book?->title_statement ?? '—')->implode('; ');
            if ($count > 5) {
                $titles .= '…';
            }

            $body = $this->replaceSmsPlaceholders(
                $student,
                $request->message,
                $count,
                $titles
            );

            $number = $this->normalizePhilippineMobile((string) $student->mobile_number);
            if ($number === '') {
                $skipped++;

                continue;
            }

            $payload[] = ['number' => $number, 'message' => $body];
        }

        if ($payload === []) {
            return back()->with('error', 'No valid mobile numbers to send to.'.($skipped > 0 ? " ({$skipped} skipped.)" : ''));
        }

        $msg = count($payload).' message(s) queued for patrons with overdue books.';
        if ($skipped > 0) {
            $msg .= " {$skipped} skipped (invalid number).";
        }

        return $this->modemFlashAfterPost($this->postToSmsModem($payload), $msg);
    }

    public function sendDirect(string $number, string $message): bool
    {
        $number = $this->normalizePhilippineMobile($number);

        if ($number === '') {
            return false;
        }

        $modemResponse = $this->postToSmsModem([
            [
                'number' => $number,
                'message' => $message,
            ],
        ]);

        return $modemResponse && $modemResponse->successful();
    }

    private function recipientQuery(Request $request): Builder
    {
        $query = LibraryStudent::query()
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
