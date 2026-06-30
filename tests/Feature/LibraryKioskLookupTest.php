<?php

namespace Tests\Feature;

use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryEmployeeEditRequest;
use App\Domain\Library\Models\LibraryPendingEmployee;
use App\Domain\Library\Models\LibraryPendingStudent;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Models\LibraryStudentEditRequest;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LibraryKioskLookupTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_scan_page_is_public_inertia(): void
    {
        $this->get(route('library.kiosk.scan'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Library/Kiosk/Lookup'));
    }

    public function test_approved_student_lookup_redirects_to_profile(): void
    {
        $student = $this->libraryStudent('S-00000001', '24-10001');

        $this->post(route('library.kiosk.lookup'), ['token' => 'S-00000001'])
            ->assertRedirect(route('library.student.qr.profile', ['qrcode' => 'S-00000001']));

        $this->get(route('library.student.qr.profile', ['qrcode' => 'S-00000001']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Library/Kiosk/StudentProfile')
                ->where('student.id', $student->id)
                ->where('patronType', 'student'));
    }

    public function test_approved_employee_lookup_redirects_to_profile(): void
    {
        $employee = $this->libraryEmployee('E-00000001', 'FAC-2024-001');

        $this->post(route('library.kiosk.lookup'), ['token' => 'E-00000001'])
            ->assertRedirect(route('library.employee.qr.profile', ['qrcode' => 'E-00000001']));

        $this->get(route('library.employee.qr.profile', ['qrcode' => 'E-00000001']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Library/Kiosk/EmployeeProfile')
                ->where('employee.id', $employee->id)
                ->where('patronType', 'employee'));
    }

    public function test_unknown_token_returns_to_scan_with_flash(): void
    {
        $this->post(route('library.kiosk.lookup'), ['token' => 'UNKNOWN-999'])
            ->assertRedirect(route('library.kiosk.scan'))
            ->assertSessionHas('lookup_status', 'not_found');
    }

    public function test_pending_student_token_shows_pending_status(): void
    {
        LibraryPendingStudent::query()->create([
            'id_number' => 'PEND-001',
            'lastname' => 'Pending',
            'firstname' => 'Student',
            'qrcode' => 'S-PENDING1',
            'course' => 'BSCS',
            'year' => '1st Year',
        ]);

        $this->post(route('library.kiosk.lookup'), ['token' => 'S-PENDING1'])
            ->assertRedirect(route('library.kiosk.scan'))
            ->assertSessionHas('lookup_status', 'pending_student');
    }

    public function test_pending_employee_token_shows_pending_status(): void
    {
        LibraryPendingEmployee::query()->create([
            'employee_id' => 'PEND-EMP-1',
            'lastname' => 'Pending',
            'firstname' => 'Employee',
            'qrcode' => 'E-PENDING1',
            'designation' => 'Staff',
            'program' => 'BSCS',
            'year_start_work' => '2024',
        ]);

        $this->post(route('library.kiosk.lookup'), ['token' => 'E-PENDING1'])
            ->assertRedirect(route('library.kiosk.scan'))
            ->assertSessionHas('lookup_status', 'pending_employee');
    }

    public function test_student_edit_request_can_be_submitted_from_kiosk(): void
    {
        $student = $this->libraryStudent('S-00000002', '24-10002');

        $this->post(route('library.students.profile.request'), [
            'student_id' => $student->id,
            'lastname' => 'Santos',
            'firstname' => 'Ana Marie',
            'middle_initial' => 'L',
            'mobile_number' => '09170000000',
        ])->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('library_student_edit_requests', [
            'student_id' => $student->id,
            'firstname' => 'Ana Marie',
            'status' => 'pending',
        ]);
    }

    public function test_student_edit_request_is_blocked_when_pending_exists(): void
    {
        $student = $this->libraryStudent('S-00000003', '24-10003');

        LibraryStudentEditRequest::query()->create([
            'student_id' => $student->id,
            'lastname' => $student->lastname,
            'firstname' => $student->firstname,
            'status' => 'pending',
        ]);

        $this->post(route('library.students.profile.request'), [
            'student_id' => $student->id,
            'lastname' => $student->lastname,
            'firstname' => 'Changed',
        ])->assertRedirect()
            ->assertSessionHas('error');
    }

    public function test_employee_edit_request_can_be_approved_by_admin(): void
    {
        $admin = $this->libraryAdmin();
        $employee = $this->libraryEmployee('E-00000002', 'FAC-2024-002');

        $request = LibraryEmployeeEditRequest::query()->create([
            'employee_id' => $employee->id,
            'lastname' => $employee->lastname,
            'firstname' => 'Pedro Updated',
            'designation' => 'Senior Librarian',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->post(route('library.admin.employee.requests.approve', $request))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('library_employees', [
            'id' => $employee->id,
            'firstname' => 'Pedro Updated',
            'designation' => 'Senior Librarian',
        ]);
    }

    public function test_student_profile_url_by_id_number_still_works(): void
    {
        $student = $this->libraryStudent('S-00000004', '24-10004');

        $this->get(route('library.student.qr.profile', ['qrcode' => '24-10004']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Library/Kiosk/StudentProfile')
                ->where('student.id', $student->id));
    }

    private function libraryStudent(string $qrcode, string $idNumber): LibraryStudent
    {
        return LibraryStudent::query()->create([
            'id_number' => $idNumber,
            'lastname' => 'Test',
            'firstname' => 'Student',
            'qrcode' => $qrcode,
            'course' => 'BSCS',
            'year' => '1st Year',
        ]);
    }

    private function libraryEmployee(string $qrcode, string $employeeId): LibraryEmployee
    {
        return LibraryEmployee::query()->create([
            'employee_id' => $employeeId,
            'lastname' => 'Test',
            'firstname' => 'Employee',
            'qrcode' => $qrcode,
            'designation' => 'Instructor',
            'program' => 'BSCS',
            'year_start_work' => '2020',
        ]);
    }

    private function libraryAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('library_admin');

        return $user;
    }
}
