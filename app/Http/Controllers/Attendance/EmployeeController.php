<?php

namespace App\Http\Controllers\Attendance;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Support\AttendanceFileStorage;
use App\Domain\Attendance\Support\QrCodeGenerator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $employees = $this->filteredEmployeesQuery($request)
            ->orderBy('lastname')
            ->paginate(15)
            ->withQueryString();

        $departments = Cache::remember('attendance.employees.departments', 600, fn () => AttendanceEmployee::query()
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->orderBy('department')
            ->pluck('department')
        );

        $positions = Cache::remember('attendance.employees.positions', 600, fn () => AttendanceEmployee::query()
            ->whereNotNull('position')
            ->where('position', '!=', '')
            ->distinct()
            ->orderBy('position')
            ->pluck('position')
        );

        return Inertia::render('Attendance/Employees/Index', [
            'employees' => $employees,
            'departments' => $departments,
            'positions' => $positions,
            'filters' => $request->only(['search', 'department', 'position']),
        ]);
    }

    private function filteredEmployeesQuery(Request $request)
    {
        $query = AttendanceEmployee::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        if ($request->filled('position')) {
            $query->where('position', $request->position);
        }

        return $query;
    }

    public function create(): Response
    {
        return Inertia::render('Attendance/Employees/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => ['nullable', 'string', 'max:255', 'unique:attendance_employees,employee_id'],
            'department' => ['nullable', 'string', 'max:255'],
            'firstname' => ['nullable', 'string', 'max:255'],
            'lastname' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'employee_number' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'sex' => ['nullable', 'string', 'max:20'],
            'tin_id_number' => ['nullable', 'string', 'max:255'],
            'philhealth_number' => ['nullable', 'string', 'max:255'],
            'civil_status' => ['nullable', 'string', 'max:255'],
            'blood_type' => ['nullable', 'string', 'max:5'],
            'sss_number' => ['nullable', 'string', 'max:255'],
            'hdmf_number' => ['nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'emergency_contact_number' => ['nullable', 'string', 'max:255'],
            'employee_signature' => ['nullable', 'string'],
            'formal_picture' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $validated['qrcode'] = QrCodeGenerator::nextEmployeeCode();

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

        AttendanceEmployee::create($validated);

        return redirect()->route('attendance.employees.index')->with('success', 'Employee registered successfully.');
    }

    public function edit(int $id): Response
    {
        return Inertia::render('Attendance/Employees/Edit', [
            'employee' => AttendanceEmployee::query()->findOrFail($id),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $employee = AttendanceEmployee::query()->findOrFail($id);

        $validated = $request->validate([
            'employee_id' => ['nullable', 'string', 'max:255', 'unique:attendance_employees,employee_id,'.$id],
            'department' => ['nullable', 'string', 'max:255'],
            'firstname' => ['nullable', 'string', 'max:255'],
            'lastname' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'employee_number' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'sex' => ['nullable', 'string', 'max:20'],
            'tin_id_number' => ['nullable', 'string', 'max:255'],
            'philhealth_number' => ['nullable', 'string', 'max:255'],
            'civil_status' => ['nullable', 'string', 'max:255'],
            'blood_type' => ['nullable', 'string', 'max:5'],
            'sss_number' => ['nullable', 'string', 'max:255'],
            'hdmf_number' => ['nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'emergency_contact_number' => ['nullable', 'string', 'max:255'],
            'employee_signature' => ['nullable', 'string'],
            'formal_picture' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

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

        unset($validated['qrcode']);
        $employee->update($validated);

        return redirect()->route('attendance.employees.index')->with('success', 'Employee updated successfully.');
    }

    public function destroy(int $id)
    {
        AttendanceEmployee::query()->findOrFail($id)->delete();

        return redirect()->route('attendance.employees.index')->with('success', 'Employee deleted successfully.');
    }
}
