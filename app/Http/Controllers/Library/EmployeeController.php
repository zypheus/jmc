<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryEmployeeEditRequest;
use App\Domain\Library\Models\LibraryPendingEmployee;
use App\Domain\Library\Models\LibraryProgram;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Domain\Library\Support\MiddleInitial;
use App\Domain\Library\Support\PerPage;
use App\Domain\Library\Support\RespondsWithHydratablePartial;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    use RespondsWithHydratablePartial;

    private function programList()
    {
        return Cache::remember('employees.program_list', 600, fn () => LibraryProgram::orderBy('program_name')->get()
        );
    }

    private function generateNextQrCode(): string
    {
        $last = LibraryEmployee::whereNotNull('qrcode')
            ->where('qrcode', 'like', 'E-%')
            ->orderByDesc('id')
            ->first();

        $nextNumber = 1;
        if ($last && preg_match('/E-(\d+)/', $last->qrcode, $matches)) {
            $nextNumber = (int) $matches[1] + 1;
        }

        return 'E-'.str_pad((string) $nextNumber, 8, '0', STR_PAD_LEFT);
    }

    /** @return list<int> */
    private function workStartYears(): array
    {
        $current = (int) date('Y');

        return range($current, 1980);
    }

    public function index(Request $request)
    {
        $programs = $this->programList();
        $workStartYears = $this->workStartYears();

        $query = LibraryEmployee::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%")
                    ->orWhere('designation', 'like', "%{$search}%")
                    ->orWhere('program', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%")
                    ->orWhere('qrcode', 'like', "%{$search}%");
            });
        }

        if ($request->filled('program')) {
            $query->where('program', $request->program);
        }

        if ($request->filled('year_start_work')) {
            $query->where('year_start_work', $request->year_start_work);
        }

        $faculty = $query->orderBy('lastname')->paginate(PerPage::resolve($request, 15))->withQueryString();

        $pendingRegistrationsCount = LibraryPendingEmployee::count();

        return Inertia::render('Library/Employees/Index', [
            'employees' => $faculty,
            'libraryPrograms' => $programs,
            'workStartYears' => $workStartYears,
            'pendingRegistrationsCount' => $pendingRegistrationsCount,
            'filters' => [
                'search' => $request->input('search', ''),
                'program' => $request->input('program', ''),
                'year_start_work' => $request->input('year_start_work', ''),
            ],
        ]);
    }

    public function create()
    {
        $programs = LibraryProgram::orderBy('program_name')->get();
        $workStartYears = $this->workStartYears();

        return Inertia::render('Library/Employees/Create', [
            'libraryPrograms' => $programs,
            'workStartYears' => $workStartYears,
        ]);
    }

    public function store(Request $request)
    {
        MiddleInitial::mergeIntoRequest($request);

        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'middle_initial' => MiddleInitial::validationRule(),
            'employee_id' => 'required|string|max:255|unique:library_employees,employee_id',
            'designation' => 'required|string|max:255',
            'program' => 'required|string|max:64',
            'year_start_work' => 'required|string|max:16',
            'birth_date' => 'nullable|date',
            'mobile_number' => 'nullable|string|max:32',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relationship' => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:255',
            'emergency_address' => 'nullable|string',
            'formal_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'employee_signature' => 'nullable|string',
        ]);

        $program = LibraryProgram::where('program_code', $validated['program'])->first();

        DB::beginTransaction();

        try {
            $validated['role_id'] = 2;
            $validated['department'] = $program?->program_name ?? $validated['program'];
            $validated['position'] = $validated['designation'];
            $validated['qrcode'] = $this->generateNextQrCode();

            if ($request->hasFile('formal_picture')) {
                $file = $request->file('formal_picture');
                $filename = time().'_profile_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
                $dest = public_path('images/formal_pictures');
                if (! is_dir($dest)) {
                    mkdir($dest, 0755, true);
                }
                $file->move($dest, $filename);
                $validated['formal_picture'] = 'images/formal_pictures/'.$filename;
            }

            if (! empty($validated['employee_signature']) && str_starts_with($validated['employee_signature'], 'data:')) {
                [$meta, $contents] = explode(',', $validated['employee_signature'], 2);
                $ext = preg_match('/jpeg|jpg/i', $meta) ? 'jpg' : 'png';
                $sigName = time().'_sig.'.$ext;
                $sigDest = public_path('images/signatures');
                if (! is_dir($sigDest)) {
                    mkdir($sigDest, 0755, true);
                }
                file_put_contents($sigDest.DIRECTORY_SEPARATOR.$sigName, base64_decode($contents));
                $validated['employee_signature'] = 'images/signatures/'.$sigName;
            }

            $employee = LibraryEmployee::create($validated);

            DB::commit();

            AdminActivityLogger::staff(
                AdminActivity::TYPE_PATRON,
                'Faculty/staff created',
                "{$employee->lastname}, {$employee->firstname}",
                route('library.employees.edit', $employee->id),
                'patron',
                $employee,
            );

            return redirect()->route('library.employees.index')
                ->with('success', 'Faculty & staff registered successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function edit($id)
    {
        $employee = LibraryEmployee::findOrFail($id);
        $programs = LibraryProgram::orderBy('program_name')->get();
        $workStartYears = $this->workStartYears();

        return Inertia::render('Library/Employees/Edit', [
            'employee' => $employee,
            'libraryPrograms' => $programs,
            'workStartYears' => $workStartYears,
        ]);
    }

    public function update(Request $request, $id)
    {
        $employee = LibraryEmployee::findOrFail($id);

        MiddleInitial::mergeIntoRequest($request);

        $validated = $request->validate([
            'employee_id' => 'required|string|max:255|unique:library_employees,employee_id,'.$employee->id,
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'middle_initial' => MiddleInitial::validationRule(),
            'designation' => 'required|string|max:255',
            'program' => 'required|string|max:64',
            'year_start_work' => 'required|string|max:16',
            'birth_date' => 'nullable|date',
            'mobile_number' => 'nullable|string|max:32',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relationship' => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:255',
            'emergency_address' => 'nullable|string',
            'employee_signature' => 'nullable|string',
            'formal_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $program = LibraryProgram::where('program_code', $validated['program'])->first();
        $validated['role_id'] = 2;
        $validated['department'] = $program?->program_name ?? $validated['program'];
        $validated['position'] = $validated['designation'];

        if ($request->hasFile('formal_picture')) {
            $file = $request->file('formal_picture');
            $filename = time().'_profile_'.preg_replace('/\s+/', '_', $file->getClientOriginalName());
            $file->move(public_path('images/formal_pictures'), $filename);
            $validated['formal_picture'] = 'images/formal_pictures/'.$filename;
        }

        if (! empty($validated['employee_signature']) && str_starts_with($validated['employee_signature'], 'data:')) {
            $data = $validated['employee_signature'];
            [$meta, $contents] = explode(',', $data, 2);
            $ext = 'png';
            if (preg_match('/data:image\/(jpeg|jpg)/i', $meta)) {
                $ext = 'jpg';
            }
            $sigName = time().'_sig.'.$ext;
            if (! file_exists(public_path('images/signatures'))) {
                mkdir(public_path('images/signatures'), 0755, true);
            }
            file_put_contents(public_path('images/signatures/'.$sigName), base64_decode($contents));
            $validated['employee_signature'] = 'images/signatures/'.$sigName;
        }

        $employee->update($validated);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PATRON,
            'Faculty/staff updated',
            "{$employee->lastname}, {$employee->firstname}",
            route('library.employees.edit', $employee->id),
            'patron',
            $employee,
        );

        return redirect()->route('library.employees.index')->with('success', 'Faculty & staff record updated.');
    }

    public function destroy($id)
    {
        $employee = LibraryEmployee::findOrFail($id);
        $label = "{$employee->lastname}, {$employee->firstname}";
        $employee->delete();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PATRON,
            'Faculty/staff deleted',
            $label,
            route('library.employees.index'),
            'patron',
        );

        return back()->with('success', 'Record deleted successfully.');
    }

    public function submitEditRequest(Request $request)
    {
        $employee = LibraryEmployee::findOrFail($request->employee_id);

        if ($employee->editRequests()->where('status', 'pending')->exists()) {
            return back()->with('error', 'You already have a pending request.');
        }

        MiddleInitial::mergeIntoRequest($request);

        $request->validate([
            'lastname' => 'required|string|max:255',
            'firstname' => 'required|string|max:255',
            'middle_initial' => MiddleInitial::validationRule(),
            'employee_id_value' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'program' => 'nullable|string|max:255',
            'year_start_work' => 'nullable|string|max:10',
            'birth_date' => 'nullable|date',
            'mobile_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relationship' => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:20',
            'emergency_address' => 'nullable|string',
            'formal_picture' => 'nullable|image|max:2048',
        ]);

        $photoPath = null;

        if ($request->hasFile('formal_picture')) {
            $image = $request->file('formal_picture');
            $filename = time().'_'.preg_replace('/\s+/', '_', $image->getClientOriginalName());
            if (! file_exists(base_path('images/edits'))) {
                mkdir(base_path('images/edits'), 0755, true);
            }
            $image->move(base_path('images/edits'), $filename);
            $photoPath = 'images/edits/'.$filename;
        }

        $editRequest = LibraryEmployeeEditRequest::create([
            'employee_id' => $employee->id,
            'lastname' => $request->lastname,
            'firstname' => $request->firstname,
            'middle_initial' => MiddleInitial::normalize($request->middle_initial),
            'employee_id_value' => $request->employee_id_value,
            'designation' => $request->designation,
            'program' => $request->program,
            'year_start_work' => $request->year_start_work,
            'birth_date' => $request->birth_date,
            'mobile_number' => $request->mobile_number,
            'address' => $request->address,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_relationship' => $request->emergency_contact_relationship,
            'emergency_contact_number' => $request->emergency_contact_number,
            'emergency_address' => $request->emergency_address,
            'formal_picture' => $photoPath,
            'status' => 'pending',
        ]);

        AdminActivityLogger::patronEditRequest(
            $editRequest,
            "{$employee->lastname}, {$employee->firstname}",
        );

        return back()->with('success', 'Edit request submitted for approval.');
    }

    public function approveEditRequest(int $id)
    {
        $req = LibraryEmployeeEditRequest::findOrFail($id);
        $employee = $req->employee;

        $newPhotoPath = $employee->formal_picture;

        if ($req->formal_picture) {
            if ($employee->formal_picture && file_exists(base_path($employee->formal_picture))) {
                unlink(base_path($employee->formal_picture));
            }
            $newPhotoPath = $req->formal_picture;
        }

        $employee->update([
            'lastname' => $req->lastname,
            'firstname' => $req->firstname,
            'middle_initial' => MiddleInitial::normalize($req->middle_initial),
            'employee_id' => $req->employee_id_value ?: $employee->employee_id,
            'designation' => $req->designation,
            'program' => $req->program,
            'year_start_work' => $req->year_start_work,
            'birth_date' => $req->birth_date,
            'mobile_number' => $req->mobile_number,
            'address' => $req->address,
            'emergency_contact_name' => $req->emergency_contact_name,
            'emergency_contact_relationship' => $req->emergency_contact_relationship,
            'emergency_contact_number' => $req->emergency_contact_number,
            'emergency_address' => $req->emergency_address,
            'formal_picture' => $newPhotoPath,
        ]);

        $req->status = 'approved';
        $req->reviewed_at = now();
        $req->reviewed_by = auth()->id();
        $req->save();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PATRON,
            'Employee edit request approved',
            "{$employee->lastname}, {$employee->firstname}",
            route('library.students.pending.requests'),
            'patron',
            $employee,
        );

        return back()->with('success', 'Request approved and changes applied.');
    }

    public function rejectEditRequest(int $id)
    {
        $req = LibraryEmployeeEditRequest::findOrFail($id);

        $req->status = 'rejected';
        $req->reviewed_at = now();
        $req->reviewed_by = auth()->id();
        $req->save();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PATRON,
            'Employee edit request rejected',
            "Request #{$req->id}",
            route('library.students.pending.requests'),
            'patron',
            $req,
        );

        return back()->with('success', 'Request rejected.');
    }
}
