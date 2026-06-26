<?php

namespace App\Http\Controllers\Attendance;

use App\Domain\Attendance\Models\AttendancePendingStudent;
use App\Domain\Attendance\Models\AttendanceProgram;
use App\Domain\Attendance\Models\AttendanceStudent;
use App\Domain\Attendance\Support\AttendanceFileStorage;
use App\Domain\Attendance\Support\PatronNameNormalizer;
use App\Domain\Attendance\Support\QrCodeGenerator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    private function programList()
    {
        if (! Schema::hasTable('attendance_programs')) {
            return collect();
        }

        return Cache::remember('attendance.program_list', 600, fn () => AttendanceProgram::query()->orderBy('program_name')->get()
        );
    }

    public function index(Request $request): Response
    {
        $students = $this->filteredStudentsQuery($request)
            ->orderBy('lastname')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Attendance/Students/Index', [
            'students' => $students,
            'programs' => $this->programList(),
            'filters' => $request->only(['search', 'course', 'year', 'program_id']),
        ]);
    }

    private function filteredStudentsQuery(Request $request)
    {
        $query = AttendanceStudent::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lastname', 'like', "%{$search}%")
                    ->orWhere('firstname', 'like', "%{$search}%")
                    ->orWhere('course', 'like', "%{$search}%")
                    ->orWhere('qrcode', 'like', "%{$search}%")
                    ->orWhere('student_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('course')) {
            $query->where('course', $request->course);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('program_id')) {
            $query->where('course', $request->program_id);
        }

        return $query;
    }

    public function create(): Response
    {
        return Inertia::render('Attendance/Students/Create', [
            'programs' => $this->programList(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'string', 'max:255', 'unique:attendance_students,student_id'],
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'middle_initial' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'course' => ['required', 'string', 'max:255'],
            'year' => ['required', 'string', 'max:255'],
            'profile_picture' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
            'student_signature' => ['nullable', 'string'],
            'mobile_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'emergency_person' => ['nullable', 'string', 'max:255'],
            'emergency_relationship' => ['nullable', 'string', 'max:255'],
            'emergency_number' => ['nullable', 'string', 'max:20'],
            'emergency_address' => ['nullable', 'string'],
        ]);

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

        $validated['qrcode'] = QrCodeGenerator::nextStudentCode();
        $validated['normalized_name'] = PatronNameNormalizer::normalizeFullName(
            $validated['firstname'].' '.$validated['lastname']
        );

        AttendanceStudent::create($validated);

        return redirect()->route('attendance.students.index')->with('success', 'Student registered successfully.');
    }

    public function edit(int $id): Response
    {
        $student = AttendanceStudent::query()->findOrFail($id);

        return Inertia::render('Attendance/Students/Edit', [
            'student' => $student,
            'programs' => $this->programList(),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $student = AttendanceStudent::query()->findOrFail($id);

        $validated = $request->validate([
            'student_id' => ['required', 'string', 'max:255', 'unique:attendance_students,student_id,'.$id],
            'lastname' => ['required', 'string', 'max:255'],
            'firstname' => ['required', 'string', 'max:255'],
            'middle_initial' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'course' => ['nullable', 'string'],
            'year' => ['nullable', 'string'],
            'mobile_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'emergency_person' => ['nullable', 'string', 'max:255'],
            'emergency_relationship' => ['nullable', 'string', 'max:255'],
            'emergency_number' => ['nullable', 'string', 'max:20'],
            'emergency_address' => ['nullable', 'string'],
            'profile_picture' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'student_signature' => ['nullable', 'string'],
        ]);

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

        $validated['normalized_name'] = PatronNameNormalizer::normalizeFullName(
            $validated['firstname'].' '.$validated['lastname']
        );

        $student->update($validated);

        return redirect()->route('attendance.students.index')->with('success', 'Student updated successfully.');
    }

    public function destroy(int $id)
    {
        AttendanceStudent::query()->findOrFail($id)->delete();

        return redirect()->route('attendance.students.index')->with('success', 'Student deleted successfully.');
    }

    public function pending(): Response
    {
        $pendingStudents = AttendancePendingStudent::query()->orderBy('lastname')->get();

        return Inertia::render('Attendance/Students/Pending', [
            'pendingStudents' => $pendingStudents,
        ]);
    }

    public function approve(int $id)
    {
        try {
            DB::transaction(function () use ($id) {
                $pending = AttendancePendingStudent::query()->lockForUpdate()->findOrFail($id);
                $qrcode = QrCodeGenerator::nextStudentCode();

                $schoolId = trim((string) ($pending->student_id ?? ''));
                if ($schoolId !== '' && AttendanceStudent::query()->where('student_id', $schoolId)->exists()) {
                    throw new \RuntimeException('Student ID already exists in attendance students.');
                }

                AttendanceStudent::create([
                    'student_id' => $pending->student_id,
                    'lastname' => $pending->lastname,
                    'firstname' => $pending->firstname,
                    'middle_initial' => $pending->middle_initial,
                    'blood_type' => $pending->blood_type,
                    'course' => $pending->course,
                    'year' => $pending->year,
                    'mobile_number' => $pending->mobile_number,
                    'emergency_person' => $pending->emergency_person,
                    'emergency_relationship' => $pending->emergency_relationship,
                    'emergency_number' => $pending->emergency_number,
                    'emergency_address' => $pending->emergency_address,
                    'address' => $pending->address,
                    'profile_picture' => $pending->profile_picture,
                    'student_signature' => $pending->student_signature,
                    'birth_date' => $pending->birth_date,
                    'qrcode' => $qrcode,
                    'normalized_name' => PatronNameNormalizer::normalizeFullName(
                        trim($pending->firstname.' '.$pending->lastname)
                    ),
                ]);

                $pending->delete();
            });

            return back()->with('success', 'Student approved and added to attendance students.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Error: '.$e->getMessage());
        }
    }

    public function reject(int $id)
    {
        AttendancePendingStudent::query()->findOrFail($id)->delete();

        return back()->with('success', 'Registration rejected.');
    }
}
