<?php

namespace App\Http\Controllers\Attendance;

use App\Domain\Attendance\Models\AttendancePendingEmployee;
use App\Domain\Attendance\Models\AttendancePendingStudent;
use App\Domain\Attendance\Support\AttendanceFileStorage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\StorePendingStudentRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PendingStudentController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Register/Attendance/Student');
    }

    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $pendingStudents = AttendancePendingStudent::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('firstname', 'like', "%{$search}%")
                        ->orWhere('lastname', 'like', "%{$search}%")
                        ->orWhere('course', 'like', "%{$search}%")
                        ->orWhere('year', 'like', "%{$search}%");
                });
            })
            ->orderBy('lastname')
            ->paginate(10, ['*'], 'students_page')
            ->withQueryString();

        $pendingEmployees = AttendancePendingEmployee::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('firstname', 'like', "%{$search}%")
                        ->orWhere('lastname', 'like', "%{$search}%")
                        ->orWhere('department', 'like', "%{$search}%")
                        ->orWhere('position', 'like', "%{$search}%");
                });
            })
            ->orderBy('lastname')
            ->paginate(10, ['*'], 'employees_page')
            ->withQueryString();

        return Inertia::render('Attendance/Pending/Index', [
            'pendingStudents' => $pendingStudents,
            'pendingEmployees' => $pendingEmployees,
            'search' => $search,
            'tab' => $request->input('tab', 'students'),
        ]);
    }

    public function store(StorePendingStudentRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('profile_picture')) {
            $validated['profile_picture'] = AttendanceFileStorage::storeImage(
                $request->file('profile_picture'),
                'images/attendance/profile_pictures'
            );
        }

        $signature = AttendanceFileStorage::storeBase64Signature(
            $validated['student_signature'] ?? null,
            'images/attendance/student_signatures'
        );

        if ($signature) {
            $validated['student_signature'] = $signature;
        } else {
            unset($validated['student_signature']);
        }

        AttendancePendingStudent::create($validated);

        return redirect()
            ->route('register.success')
            ->with('success', 'Student registration submitted. Await admin approval.');
    }
}
