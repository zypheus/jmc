<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Imports\LibraryStudentsImport;
use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryBookReservation;
use App\Domain\Library\Models\LibraryPendingStudent;
use App\Domain\Library\Models\LibraryProgram;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Models\LibraryStudentEditRequest;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Domain\Library\Support\MiddleInitial;
use App\Domain\Library\Support\PerPage;
use App\Domain\Library\Support\RespondsWithHydratablePartial;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends Controller
{
    use RespondsWithHydratablePartial;

    private function programList()
    {
        return Cache::remember('students.program_list', 600, fn () => LibraryProgram::orderBy('program_code')->get()
        );
    }

    private function generateNextQrCode()
    {
        $lastStudent = LibraryStudent::whereNotNull('qrcode')
            ->orderByDesc('id')
            ->first();

        $nextNumber = 1;

        if ($lastStudent && preg_match('/S-(\d+)/', $lastStudent->qrcode, $matches)) {
            $nextNumber = (int) $matches[1] + 1;
        }

        return 'S-'.str_pad($nextNumber, 8, '0', STR_PAD_LEFT);
    }

    // Show all students
    public function index(Request $request)
    {
        $query = LibraryStudent::query();
        $programs = $this->programList();

        // 🔍 Search
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lastname', 'like', "%{$search}%")
                    ->orWhere('firstname', 'like', "%{$search}%")
                    ->orWhere('course', 'like', "%{$search}%")
                    ->orWhere('qrcode', 'like', "%{$search}%")
                    ->orWhere('id_number', 'like', "%{$search}%");
            });
        }

        // 🎓 Filter by Course
        if ($request->filled('course')) {
            $query->where('course', $request->course);
        }

        // 📚 Filter by Year
        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }
        if ($request->filled('program_id')) {
            $query->where('course', $request->program_id);
        }

        $students = $query->orderBy('lastname', 'asc')->paginate(PerPage::resolve($request, 15))->withQueryString();

        $pendingEditsCount = LibraryStudentEditRequest::where('status', 'pending')->count();
        $pendingRegistrationsCount = LibraryPendingStudent::count();

        return Inertia::render('Library/Students/Index', [
            'students' => $students,
            'libraryPrograms' => $programs,
            'pendingEditsCount' => $pendingEditsCount,
            'pendingRegistrationsCount' => $pendingRegistrationsCount,
            'filters' => [
                'search' => $request->input('search', ''),
                'course' => $request->input('course', ''),
                'year' => $request->input('year', ''),
                'program_id' => $request->input('program_id', ''),
            ],
        ]);
    }

    // Show form to create new student
    public function create()
    {
        $programs = LibraryProgram::orderBy('program_name')->get();

        return Inertia::render('Library/Students/Create', [
            'libraryPrograms' => $programs,
        ]);
    }

    // Store new student
    public function store(Request $request)
    {
        MiddleInitial::mergeIntoRequest($request);

        $validated = $request->validate([
            'id_number' => 'required|string|max:255|unique:library_students,id_number',
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'middle_initial' => MiddleInitial::validationRule(),
            'birthday' => 'nullable|date',
            'course' => 'required|string|max:255',
            'year' => 'required|string|max:255',
            'mobile_number' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'emergency_person' => 'nullable|string|max:255',
            'emergency_relationship' => 'nullable|string|max:255',
            'emergency_number' => 'nullable|string|max:255',
            'emergency_address' => 'nullable|string',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'student_signature' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {

            // Profile Picture
            if ($request->hasFile('profile_picture')) {
                $file = $request->file('profile_picture');
                $filename = time().'_profile_'.Str::slug($file->getClientOriginalName());
                $dest = public_path('images/profile_pictures');
                if (! file_exists($dest)) {
                    mkdir($dest, 0755, true);
                }
                $file->move($dest, $filename);
                $validated['profile_picture'] = 'images/profile_pictures/'.$filename;
            }

            // Signature (base64)
            if (! empty($validated['student_signature']) && str_starts_with($validated['student_signature'], 'data:')) {

                [$meta, $contents] = explode(',', $validated['student_signature'], 2);
                $ext = preg_match('/jpeg|jpg/i', $meta) ? 'jpg' : 'png';
                $sigName = time().'_sig.'.$ext;

                $sigDest = public_path('images/student_signatures');
                if (! file_exists($sigDest)) {
                    mkdir($sigDest, 0755, true);
                }

                file_put_contents(
                    $sigDest.DIRECTORY_SEPARATOR.$sigName,
                    base64_decode($contents)
                );

                $validated['student_signature'] = 'images/student_signatures/'.$sigName;
            }

            // ✅ Generate QR ONCE
            $validated['qrcode'] = $this->generateNextQrCode();

            $student = LibraryStudent::create($validated);

            DB::commit();

            AdminActivityLogger::staff(
                AdminActivity::TYPE_PATRON,
                'Student created',
                "{$student->lastname}, {$student->firstname} ({$student->id_number})",
                route('library.students.edit', $student->id),
                'patron',
                $student,
            );

            return redirect()->route('library.students.index')
                ->with('success', 'Student Registered Successfully!');

        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->with('error', $e->getMessage());
        }
    }

    // Edit form
    public function edit($id)
    {
        $student = LibraryStudent::findOrFail($id);

        return Inertia::render('Library/Students/Edit', [
            'student' => $student,
            'libraryPrograms' => LibraryProgram::orderBy('program_name')->get(),
        ]);
    }

    // Update student
    public function update(Request $request, $id)
    {
        $student = LibraryStudent::findOrFail($id);

        MiddleInitial::mergeIntoRequest($request);

        $validated = $request->validate([
            'id_number' => 'nullable|string|unique:library_students,id_number,'.$id,
            'lastname' => 'required|string|max:255',
            'firstname' => 'required|string|max:255',
            'middle_initial' => MiddleInitial::validationRule(),
            'birthday' => 'nullable|date',

            'course' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:255',

            'mobile_number' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',

            'emergency_person' => 'nullable|string|max:255',
            'emergency_relationship' => 'nullable|string|max:255',
            'emergency_number' => 'nullable|string|max:255',
            'emergency_address' => 'nullable|string',

            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'student_signature' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {

            if ($request->hasFile('profile_picture')) {

                if ($student->profile_picture && file_exists(public_path($student->profile_picture))) {
                    unlink(public_path($student->profile_picture));
                }

                $image = $request->file('profile_picture');
                $filename = time().'_'.Str::slug($image->getClientOriginalName());
                $dest = public_path('images/profile_pictures');
                if (! file_exists($dest)) {
                    mkdir($dest, 0755, true);
                }
                $image->move($dest, $filename);
                $validated['profile_picture'] = 'images/profile_pictures/'.$filename;
            }

            if (! empty($validated['student_signature']) && str_starts_with($validated['student_signature'], 'data:')) {

                [$meta, $contents] = explode(',', $validated['student_signature'], 2);
                $ext = preg_match('/jpeg|jpg/i', $meta) ? 'jpg' : 'png';
                $sigName = time().'_sig.'.$ext;

                $sigDest = public_path('images/student_signatures');
                if (! file_exists($sigDest)) {
                    mkdir($sigDest, 0755, true);
                }

                file_put_contents(
                    $sigDest.DIRECTORY_SEPARATOR.$sigName,
                    base64_decode($contents)
                );

                $validated['student_signature'] = 'images/student_signatures/'.$sigName;
            }

            // ❌ DO NOT TOUCH QR HERE
            $student->update($validated);

            DB::commit();

            AdminActivityLogger::staff(
                AdminActivity::TYPE_PATRON,
                'Student updated',
                "{$student->lastname}, {$student->firstname} ({$student->id_number})",
                route('library.students.edit', $student->id),
                'patron',
                $student,
            );

            return redirect()->route('library.students.index')
                ->with('success', 'Student updated successfully!');

        } catch (\Throwable $e) {
            DB::rollBack();
            dd($e->getMessage());
        }
    }

    // Delete student
    public function destroy($id)
    {
        $student = LibraryStudent::findOrFail($id);

        if ($student->profile_picture) {
            Storage::disk('public')->delete($student->profile_picture);
        }

        $label = "{$student->lastname}, {$student->firstname} ({$student->id_number})";
        $student->delete();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PATRON,
            'Student deleted',
            $label,
            route('library.students.index'),
            'patron',
        );

        return redirect()->route('library.students.index')->with('success', 'Student Deleted Successfully!');
    }

    public function show($id)
    {
        $student = LibraryStudent::findOrFail($id);

        return view('students.show', compact('student'));
    }

    // Pending list
    public function pending()
    {
        $pendingStudents = LibraryPendingStudent::orderBy('lastname')->get();

        return view('students.pending', compact('pendingStudents'));
    }

    // Approve pending student → move to students table
    public function approve($id)
    {
        DB::beginTransaction();

        try {
            $pending = LibraryPendingStudent::findOrFail($id);

            if (LibraryStudent::where('id_number', $pending->id_number)->exists()) {
                throw new \Exception('ID Number already exists in students table.');
            }

            LibraryStudent::create([
                'id_number' => strtoupper($pending->id_number),
                'lastname' => strtoupper($pending->lastname),
                'firstname' => strtoupper($pending->firstname),
                'middle_initial' => MiddleInitial::normalize($pending->middle_initial),
                'birthday' => $pending->birthday,
                'course' => strtoupper($pending->course),
                'year' => strtoupper($pending->year),
                'mobile_number' => $pending->mobile_number,
                'email' => $pending->email,
                'address' => $pending->address,
                'emergency_person' => $pending->emergency_person,
                'emergency_relationship' => $pending->emergency_relationship,
                'emergency_number' => $pending->emergency_number,
                'emergency_address' => $pending->emergency_address,
                'profile_picture' => $pending->profile_picture,
                'student_signature' => $pending->student_signature,
                'qrcode' => $pending->qrcode ?: $this->generateNextQrCode(),
            ]);

            $pending->delete();

            DB::commit();

            AdminActivityLogger::staff(
                AdminActivity::TYPE_PATRON,
                'Pending student approved',
                "{$pending->lastname}, {$pending->firstname} ({$pending->id_number})",
                route('library.students.index'),
                'patron',
            );

            return back()->with('success', 'Student approved and added to the students table.');

        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->with('error', 'Error: '.$e->getMessage());
        }
    }

    // Reject pending student
    public function reject($id)
    {
        $pending = LibraryPendingStudent::findOrFail($id);
        $label = "{$pending->lastname}, {$pending->firstname} ({$pending->id_number})";
        $pending->delete();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PATRON,
            'Pending student rejected',
            $label,
            route('library.pending.index'),
            'patron',
        );

        return back()->with('success', 'Registration rejected.');
    }

    public function profile(string $qrcode)
    {
        $token = trim($qrcode);

        $student = LibraryStudent::query()
            ->where(function ($q) use ($token) {
                $q->where('qrcode', $token)
                    ->orWhere('id_number', $token)
                    ->orWhereRaw('LOWER(TRIM(id_number)) = ?', [strtolower($token)]);
            })
            ->firstOrFail();
        session(['student_id' => $student->id]);

        $program = LibraryProgram::where('program_code', $student->course)->first();
        $programs = LibraryProgram::orderBy('program_name')->get();

        LibraryBookReservation::expireStale();

        $bookReservations = LibraryBookReservation::query()
            ->with('book')
            ->where('student_id', $student->id)
            ->whereIn('status', [LibraryBookReservation::STATUS_PENDING, LibraryBookReservation::STATUS_READY])
            ->orderByDesc('reserved_at')
            ->get();

        $readyReservations = $bookReservations->where('status', LibraryBookReservation::STATUS_READY)->values();
        $pendingReservations = $bookReservations->where('status', LibraryBookReservation::STATUS_PENDING)->values();

        $legacyComma = "{$student->lastname}, {$student->firstname}";
        $legacySpace = trim("{$student->firstname} {$student->lastname}");

        $borrowedBooks = LibraryBookLog::with('book')
            ->where(function ($q) use ($student, $legacyComma, $legacySpace) {
                $q->where('student_id', $student->id)
                    ->orWhere(function ($q2) use ($legacyComma, $legacySpace) {
                        $q2->whereNull('student_id')
                            ->where(function ($q3) use ($legacyComma, $legacySpace) {
                                $q3->where('patron_name', $legacyComma)
                                    ->orWhere('patron_name', $legacySpace);
                            });
                    });
            })
            ->where('status', 'Checked Out')
            ->whereNull('returned_date')
            ->get();

        $booksOutCount = $borrowedBooks->count();
        $overdueBooksCount = $borrowedBooks->filter(fn (LibraryBookLog $log) => (int) $log->days_overdue > 0)->count();
        $totalOutstandingFine = round(
            $borrowedBooks->sum(fn (LibraryBookLog $log) => (float) $log->total_fine),
            2
        );

        $returnedFinesBase = LibraryBookLog::query()
            ->where(function ($q) use ($student, $legacyComma, $legacySpace) {
                $q->where('student_id', $student->id)
                    ->orWhere(function ($q2) use ($legacyComma, $legacySpace) {
                        $q2->whereNull('student_id')
                            ->where(function ($q3) use ($legacyComma, $legacySpace) {
                                $q3->where('patron_name', $legacyComma)
                                    ->orWhere('patron_name', $legacySpace);
                            });
                    });
            })
            ->where('status', 'Checked In')
            ->where('fine_incurred', '>', 0);

        $totalReturnedFinesOutstanding = round(
            (float) (clone $returnedFinesBase)->whereNull('fine_cleared_at')->sum('fine_incurred'),
            2
        );

        $returnedFineHistory = (clone $returnedFinesBase)
            ->with(['book', 'clearedBy'])
            ->orderByDesc('returned_date')
            ->limit(25)
            ->get();

        $bookTransactionHistory = LibraryBookLog::query()
            ->with('book')
            ->where(function ($q) use ($student, $legacyComma, $legacySpace) {
                $q->where('student_id', $student->id)
                    ->orWhere(function ($q2) use ($legacyComma, $legacySpace) {
                        $q2->whereNull('student_id')
                            ->where(function ($q3) use ($legacyComma, $legacySpace) {
                                $q3->where('patron_name', $legacyComma)
                                    ->orWhere('patron_name', $legacySpace);
                            });
                    });
            })
            ->orderByDesc('timestamp')
            ->orderByDesc('id')
            ->limit(75)
            ->get();

        return view('students.profile', compact(
            'student',
            'program',
            'library_programs',
            'readyReservations',
            'pendingReservations',
            'borrowedBooks',
            'booksOutCount',
            'overdueBooksCount',
            'totalOutstandingFine',
            'returnedFineHistory',
            'totalReturnedFinesOutstanding',
            'bookTransactionHistory'
        ));
    }

    public function submitEditRequest(Request $request)
    {
        $student = LibraryStudent::findOrFail($request->student_id);

        if ($student->editRequests()->where('status', 'pending')->exists()) {
            return back()->with('error', 'You already have a pending request.');
        }

        MiddleInitial::mergeIntoRequest($request);

        $request->validate([
            'lastname' => 'required|string|max:255',
            'firstname' => 'required|string|max:255',
            'middle_initial' => MiddleInitial::validationRule(),
            'birthday' => 'nullable|date',
            'program_id' => 'nullable|exists:programs,id',
            'year' => 'nullable|string|max:10',
            'mobile_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'emergency_person' => 'nullable|string|max:255',
            'emergency_relationship' => 'nullable|string|max:255',
            'emergency_number' => 'nullable|string|max:20',
            'emergency_address' => 'nullable|string',
            'profile_picture' => 'nullable|image|max:2048',
        ]);

        $photoPath = null;

        if ($request->hasFile('profile_picture')) {
            $image = $request->file('profile_picture');
            $filename = time().'_'.preg_replace('/\s+/', '_', $image->getClientOriginalName());
            if (! file_exists(base_path('images/edits'))) {
                mkdir(base_path('images/edits'), 0755, true);
            }
            $image->move(base_path('images/edits'), $filename);
            $photoPath = 'images/edits/'.$filename;
        }

        LibraryStudentEditRequest::create([
            'student_id' => $student->id,
            'lastname' => $request->lastname,
            'firstname' => $request->firstname,
            'middle_initial' => MiddleInitial::normalize($request->middle_initial),
            'birthday' => $request->birthday,
            'program_id' => $request->program_id,
            'year' => $request->year,
            'mobile_number' => $request->mobile_number,
            'address' => $request->address,
            'emergency_person' => $request->emergency_person,
            'emergency_relationship' => $request->emergency_relationship,
            'emergency_number' => $request->emergency_number,
            'emergency_address' => $request->emergency_address,
            'profile_picture' => $photoPath,
            'email' => $request->email,
        ]);

        $editRequest = $student->editRequests()->latest()->first();
        if ($editRequest) {
            AdminActivityLogger::patronEditRequest(
                $editRequest,
                "{$student->lastname}, {$student->firstname}",
            );
        }

        return back()->with('success', 'Edit request submitted for approval.');
    }

    public function approveRequest($id)
    {
        $req = LibraryStudentEditRequest::findOrFail($id);
        $student = $req->student;

        $newProfilePath = $student->profile_picture;

        if ($req->profile_picture) {
            if ($student->profile_picture && file_exists(base_path($student->profile_picture))) {
                unlink(base_path($student->profile_picture));
            }
            $newProfilePath = $req->profile_picture;
        }

        $programCode = $student->course;
        if ($req->program_id) {
            $program = LibraryProgram::find($req->program_id);
            $programCode = $program ? $program->program_code : $student->course;
        }

        $student->update([
            'lastname' => $req->lastname,
            'firstname' => $req->firstname,
            'middle_initial' => MiddleInitial::normalize($req->middle_initial),
            'birthday' => $req->birthday,
            'course' => $programCode,
            'year' => $req->year,
            'mobile_number' => $req->mobile_number,
            'address' => $req->address,
            'emergency_person' => $req->emergency_person,
            'emergency_relationship' => $req->emergency_relationship,
            'emergency_number' => $req->emergency_number,
            'emergency_address' => $req->emergency_address,
            'profile_picture' => $newProfilePath,
            'email' => $req->email ?? $student->email,
        ]);

        $req->status = 'approved';
        $req->reviewed_at = now();
        $req->reviewed_by = auth()->id();
        $req->save();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PATRON,
            'Patron edit request approved',
            "{$student->lastname}, {$student->firstname}",
            route('library.students.pending.requests'),
            'patron',
            $student,
        );

        return back()->with('success', 'Request approved and changes applied.');
    }

    public function rejectRequest($id)
    {
        $req = LibraryStudentEditRequest::findOrFail($id);

        $req->status = 'rejected';
        $req->reviewed_at = now();
        $req->reviewed_by = auth()->id();
        $req->save();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PATRON,
            'Patron edit request rejected',
            "Request #{$req->id}",
            route('library.students.pending.requests'),
            'patron',
            $req,
        );

        return back()->with('success', 'Request rejected.');
    }

    public function pendingRequests(Request $request)
    {
        $search = $request->search;

        $perPage = PerPage::resolve($request, 10);

        $pending = LibraryStudentEditRequest::with('student')
            ->where('status', 'pending')
            ->when($search, function ($query) use ($search) {
                $query->whereHas('student', function ($q) use ($search) {
                    $q->where('lastname', 'like', "%{$search}%")
                        ->orWhere('firstname', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage, ['*'], 'pending_page')
            ->withQueryString();

        $logs = LibraryStudentEditRequest::with('student')
            ->whereIn('status', ['approved', 'rejected'])
            ->when($search, function ($query) use ($search) {
                $query->whereHas('student', function ($q) use ($search) {
                    $q->where('lastname', 'like', "%{$search}%")
                        ->orWhere('firstname', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage, ['*'], 'logs_page')
            ->withQueryString();

        return Inertia::render('Library/Students/PendingRequests', [
            'pending' => $pending,
            'logs' => $logs,
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    public function export()
    {
        $fileName = 'students_export_'.date('Y-m-d_H-i-s').'.csv';

        $students = LibraryStudent::all();

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$fileName}",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate',
            'Expires' => '0',
        ];

        $columns = [
            'ID',
            'ID Number',
            'Last Name',
            'First Name',
            'Middle Initial',
            'Birthday',
            'QR Code',
            'Course',
            'Year',
            'Mobile Number',
            'Address',
            'Emergency Person',
            'Emergency Relationship',
            'Emergency Number',
            'Emergency Address',
            'Profile Picture',
            'Student Signature',
            'Created At',
            'Updated At',
        ];

        $callback = function () use ($students, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($students as $student) {
                fputcsv($file, [
                    $student->id,
                    $student->id_number,
                    $student->lastname,
                    $student->firstname,
                    $student->middle_initial,
                    $student->birthday,
                    $student->qrcode,
                    $student->course,
                    $student->year,
                    $student->mobile_number,
                    $student->address,
                    $student->emergency_person,
                    $student->emergency_relationship,
                    $student->emergency_number,
                    $student->emergency_address,
                    $student->profile_picture,
                    $student->student_signature,
                    $student->created_at,
                    $student->updated_at,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv',
        ]);

        Excel::import(new LibraryStudentsImport, $request->file('file'));

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PATRON,
            'Students imported',
            'Bulk import from spreadsheet',
            route('library.students.index'),
            'patron',
        );

        return redirect()->back()->with('success', 'Students imported successfully.');
    }
}
