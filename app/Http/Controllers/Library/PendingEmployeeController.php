<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryPendingEmployee;
use App\Domain\Library\Models\LibraryProgram;
use App\Domain\Library\Models\LibraryRole;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Domain\Library\Support\MiddleInitial;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PendingEmployeeController extends Controller
{
    public function create(): Response
    {
        $libraryRoles = LibraryRole::all();
        $libraryPrograms = LibraryProgram::orderBy('program_name')->get();
        $workStartYears = range((int) date('Y'), 1980);

        return Inertia::render('Register/Library/Employee', [
            'libraryRoles' => $libraryRoles,
            'libraryPrograms' => $libraryPrograms,
            'workStartYears' => $workStartYears,
        ]);
    }

    public function index(Request $request)
    {
        return redirect()->route('library.pending.index', array_merge(
            $request->query(),
            ['tab' => 'library_employees'],
        ));
    }

    public function store(Request $request)
    {
        MiddleInitial::mergeIntoRequest($request);

        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'middle_initial' => MiddleInitial::validationRule(),
            'employee_id' => 'required|string|max:255|unique:pending_employees,employee_id',
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

        $validated['role_id'] = 2;
        $validated['department'] = $program?->program_name ?? $validated['program'];
        $validated['position'] = $validated['designation'];

        if ($request->hasFile('formal_picture')) {
            $file = $request->file('formal_picture');
            $filename = time().'_profile_'.preg_replace('/\s+/', '_', $file->getClientOriginalName());
            $dest = public_path('images/formal_pictures');
            if (! is_dir($dest)) {
                mkdir($dest, 0755, true);
            }
            $file->move($dest, $filename);
            $validated['formal_picture'] = 'images/formal_pictures/'.$filename;
        }

        if (! empty($validated['employee_signature']) && str_starts_with($validated['employee_signature'], 'data:')) {
            [$meta, $contents] = explode(',', $validated['employee_signature'], 2);
            $ext = preg_match('/data:image\/(jpeg|jpg)/i', $meta) ? 'jpg' : 'png';
            $sigName = time().'_sig.'.$ext;
            $sigDest = public_path('images/signatures');
            if (! is_dir($sigDest)) {
                mkdir($sigDest, 0755, true);
            }
            file_put_contents($sigDest.DIRECTORY_SEPARATOR.$sigName, base64_decode($contents));
            $validated['employee_signature'] = 'images/signatures/'.$sigName;
        }

        $last = LibraryPendingEmployee::orderByDesc('id')->first();
        $nextNumber = 1;
        if ($last && ! empty($last->qrcode) && str_starts_with($last->qrcode, 'E-')) {
            $nextNumber = (int) Str::after($last->qrcode, 'E-') + 1;
        }
        $validated['qrcode'] = 'E-'.str_pad((string) $nextNumber, 8, '0', STR_PAD_LEFT);

        LibraryPendingEmployee::create($validated);

        AdminActivityLogger::patronRegistration(
            'employee',
            "{$validated['lastname']}, {$validated['firstname']}",
            $validated['employee_id'],
        );

        return redirect()
            ->route('register.success')
            ->with('success', 'Faculty & staff registration submitted. Please wait for library approval.');
    }

    public function approve($id)
    {
        DB::beginTransaction();

        try {
            $pending = LibraryPendingEmployee::findOrFail($id);

            $lastEmployee = LibraryEmployee::orderByDesc('id')->first();
            $lastQr = $lastEmployee?->qrcode;
            $nextNumber = 1;

            if ($lastQr && str_starts_with($lastQr, 'E-')) {
                $nextNumber = (int) substr($lastQr, 2) + 1;
            }

            $newQr = 'E-'.str_pad((string) $nextNumber, 8, '0', STR_PAD_LEFT);

            LibraryEmployee::create([
                'employee_id' => $pending->employee_id,
                'formal_picture' => $pending->formal_picture,
                'department' => $pending->department,
                'firstname' => $pending->firstname,
                'lastname' => $pending->lastname,
                'middle_initial' => MiddleInitial::normalize($pending->middle_initial),
                'position' => $pending->position,
                'designation' => $pending->designation ?? $pending->position,
                'program' => $pending->program,
                'year_start_work' => $pending->year_start_work,
                'birth_date' => $pending->birth_date,
                'mobile_number' => $pending->mobile_number,
                'sex' => $pending->sex,
                'tin_id_number' => $pending->tin_id_number,
                'philhealth_number' => $pending->philhealth_number,
                'civil_status' => $pending->civil_status,
                'blood_type' => $pending->blood_type,
                'sss_number' => $pending->sss_number,
                'hdmf_number' => $pending->hdmf_number,
                'qrcode' => $newQr,
                'emergency_contact_name' => $pending->emergency_contact_name,
                'emergency_contact_relationship' => $pending->emergency_contact_relationship,
                'address' => $pending->address,
                'emergency_contact_number' => $pending->emergency_contact_number,
                'emergency_address' => $pending->emergency_address,
                'employee_signature' => $pending->employee_signature,
                'role_id' => 2,
            ]);

            $pending->delete();

            DB::commit();

            AdminActivityLogger::staff(
                AdminActivity::TYPE_PATRON,
                'Pending faculty/staff approved',
                "{$pending->lastname}, {$pending->firstname} ({$pending->employee_id})",
                route('library.employees.index'),
                'patron',
            );

            return back()->with('success', 'Faculty & staff approved and added to the directory.');
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->with('error', 'Error: '.$e->getMessage());
        }
    }

    public function reject($id)
    {
        $pending = LibraryPendingEmployee::findOrFail($id);
        $label = "{$pending->lastname}, {$pending->firstname} ({$pending->employee_id})";
        $pending->delete();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PATRON,
            'Pending faculty/staff rejected',
            $label,
            route('library.pending.employees'),
            'patron',
        );

        return back()->with('success', 'Registration rejected.');
    }
}
