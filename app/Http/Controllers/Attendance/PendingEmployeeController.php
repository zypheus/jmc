<?php

namespace App\Http\Controllers\Attendance;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendancePendingEmployee;
use App\Domain\Attendance\Support\AttendanceFileStorage;
use App\Domain\Attendance\Support\QrCodeGenerator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\StorePendingEmployeeRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PendingEmployeeController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Register/Attendance/Employee');
    }

    public function store(StorePendingEmployeeRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('formal_picture')) {
            $validated['formal_picture'] = AttendanceFileStorage::storeImage(
                $request->file('formal_picture'),
                'images/attendance/formal_pictures'
            );
        }

        $signature = AttendanceFileStorage::storeBase64Signature(
            $validated['employee_signature'] ?? null,
            'images/attendance/signatures',
            'employee_sig'
        );

        if ($signature) {
            $validated['employee_signature'] = $signature;
        } else {
            unset($validated['employee_signature']);
        }

        $last = AttendancePendingEmployee::query()->orderByDesc('id')->first();
        $nextNumber = 1;
        if ($last && ! empty($last->qrcode) && str_starts_with((string) $last->qrcode, 'E-')) {
            $nextNumber = (int) Str::after((string) $last->qrcode, 'E-') + 1;
        }
        $validated['qrcode'] = 'E-'.str_pad((string) $nextNumber, 8, '0', STR_PAD_LEFT);

        AttendancePendingEmployee::create($validated);

        return back()->with('success', 'Employee registration submitted. Await admin approval.');
    }

    public function approve(int $id)
    {
        DB::beginTransaction();

        try {
            $pending = AttendancePendingEmployee::query()->lockForUpdate()->findOrFail($id);
            $qrcode = QrCodeGenerator::nextEmployeeCode();

            AttendanceEmployee::create([
                'employee_id' => $pending->employee_id,
                'employee_number' => $pending->employee_number,
                'formal_picture' => $pending->formal_picture,
                'department' => $pending->department,
                'firstname' => $pending->firstname,
                'lastname' => $pending->lastname,
                'position' => $pending->position,
                'birth_date' => $pending->birth_date,
                'sex' => $pending->sex,
                'tin_id_number' => $pending->tin_id_number,
                'philhealth_number' => $pending->philhealth_number,
                'civil_status' => $pending->civil_status,
                'blood_type' => $pending->blood_type,
                'sss_number' => $pending->sss_number,
                'hdmf_number' => $pending->hdmf_number,
                'qrcode' => $qrcode,
                'emergency_contact_name' => $pending->emergency_contact_name,
                'emergency_contact_relationship' => $pending->emergency_contact_relationship,
                'address' => $pending->address,
                'emergency_contact_number' => $pending->emergency_contact_number,
                'employee_signature' => $pending->employee_signature,
            ]);

            $pending->delete();
            DB::commit();

            return back()->with('success', 'Employee approved and added to attendance employees.');
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->with('error', 'Error: '.$e->getMessage());
        }
    }

    public function reject(int $id)
    {
        AttendancePendingEmployee::query()->findOrFail($id)->delete();

        return back()->with('success', 'Employee registration rejected.');
    }
}
