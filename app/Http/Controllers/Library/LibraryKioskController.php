<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Services\LibraryPatronLookupService;
use App\Domain\Library\Services\LibraryPatronProfileService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Library\KioskLookupRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LibraryKioskController extends Controller
{
    public function __construct(
        private LibraryPatronLookupService $lookup,
        private LibraryPatronProfileService $profiles,
    ) {}

    public function scan(): Response
    {
        return Inertia::render('Library/Kiosk/Lookup');
    }

    public function lookup(KioskLookupRequest $request): RedirectResponse
    {
        $result = $this->lookup->resolve($request->validated('token'));

        return match ($result['status']) {
            LibraryPatronLookupService::STATUS_APPROVED_STUDENT => redirect()->route(
                'library.student.qr.profile',
                ['qrcode' => $request->validated('token')]
            ),
            LibraryPatronLookupService::STATUS_APPROVED_EMPLOYEE => redirect()->route(
                'library.employee.qr.profile',
                ['qrcode' => $request->validated('token')]
            ),
            default => redirect()
                ->route('library.kiosk.scan')
                ->with('lookup_status', $result['status']),
        };
    }

    public function studentProfile(string $qrcode): Response
    {
        $token = trim($qrcode);

        $student = LibraryStudent::query()
            ->where(function ($q) use ($token) {
                $q->where('qrcode', $token)
                    ->orWhere('id_number', $token)
                    ->orWhereRaw('LOWER(TRIM(id_number)) = ?', [strtolower($token)]);
            })
            ->firstOrFail();

        return Inertia::render('Library/Kiosk/StudentProfile', $this->profiles->forStudent($student));
    }

    public function employeeProfile(string $qrcode): Response
    {
        $token = trim($qrcode);

        $employee = LibraryEmployee::query()
            ->where(function ($q) use ($token) {
                $q->where('qrcode', $token)
                    ->orWhere('employee_id', $token)
                    ->orWhereRaw('LOWER(TRIM(employee_id)) = ?', [strtolower($token)]);
            })
            ->firstOrFail();

        return Inertia::render('Library/Kiosk/EmployeeProfile', $this->profiles->forEmployee($employee));
    }
}
