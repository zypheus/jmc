<?php

namespace Tests\Feature;

use App\Domain\Attendance\Models\AttendancePendingStudent;
use App\Domain\Attendance\Models\AttendanceStudent;
use App\Domain\Library\Models\LibraryPendingStudent;
use App\Domain\Library\Models\LibraryStudent;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatronModuleIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_approving_one_modules_registration_does_not_consume_the_other_modules_record(): void
    {
        $attendanceAdmin = $this->userWithRole('attendance_admin');
        $libraryAdmin = $this->userWithRole('library_admin');
        $attendancePending = $this->attendancePending('2026-0001');
        $libraryPending = $this->libraryPending('2026-0001');

        $this->actingAs($attendanceAdmin)
            ->post(route('attendance.pending.students.approve', $attendancePending))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('attendance_students', ['student_id' => '2026-0001']);
        $this->assertDatabaseHas('library_pending_students', ['id' => $libraryPending->id]);
        $this->assertDatabaseMissing('library_students', ['id_number' => '2026-0001']);

        $this->actingAs($libraryAdmin)
            ->post(route('library.students.approve', $libraryPending))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('attendance_students', ['student_id' => '2026-0001']);
        $this->assertDatabaseHas('library_students', ['id_number' => '2026-0001']);
    }

    public function test_deleting_and_reusing_an_attendance_id_does_not_modify_library_patron_data(): void
    {
        $attendanceAdmin = $this->userWithRole('attendance_admin');
        $attendance = $this->attendanceStudent('2026-0002', 'A-00000001');
        $library = $this->libraryStudent('2026-0002', 'L-00000001');

        $this->actingAs($attendanceAdmin)
            ->delete(route('attendance.students.destroy', $attendance))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('attendance_students', ['id' => $attendance->id]);
        $this->assertDatabaseHas('library_students', ['id' => $library->id, 'id_number' => '2026-0002']);

        $pending = $this->attendancePending('2026-0002');
        $this->actingAs($attendanceAdmin)
            ->post(route('attendance.pending.students.approve', $pending))
            ->assertSessionHas('success');

        $this->assertDatabaseCount('attendance_students', 1);
        $this->assertDatabaseHas('attendance_students', ['student_id' => '2026-0002']);
        $this->assertDatabaseHas('library_students', ['id' => $library->id, 'id_number' => '2026-0002']);
    }

    public function test_attendance_scanner_never_resolves_a_library_only_qr_code(): void
    {
        $this->libraryStudent('2026-0003', 'S-00000042');

        $this->post(route('attendance.process'), ['qrcode' => 'S-00000042'])
            ->assertOk()
            ->assertJson([
                'type' => 'error',
                'message' => 'RFID or QR code not recognized.',
            ]);

        $attendance = $this->attendanceStudent('2026-0003', 'S-00000042');

        $this->post(route('attendance.process'), ['qrcode' => 'S-00000042'])
            ->assertOk()
            ->assertJson([
                'type' => 'student',
                'patron_id' => $attendance->id,
            ]);
    }

    public function test_duplicate_institutional_ids_are_rejected_within_each_module(): void
    {
        $attendanceAdmin = $this->userWithRole('attendance_admin');
        $libraryAdmin = $this->userWithRole('library_admin');
        $this->attendanceStudent('2026-0004', 'A-00000004');
        $this->libraryStudent('2026-0004', 'L-00000004');
        $attendancePending = $this->attendancePending('2026-0004');
        $libraryPending = $this->libraryPending('2026-0004');

        $this->actingAs($attendanceAdmin)
            ->post(route('attendance.pending.students.approve', $attendancePending))
            ->assertSessionHas('error');

        $this->actingAs($libraryAdmin)
            ->post(route('library.students.approve', $libraryPending))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('attendance_pending_students', ['id' => $attendancePending->id]);
        $this->assertDatabaseHas('library_pending_students', ['id' => $libraryPending->id]);
        $this->assertDatabaseCount('attendance_students', 1);
        $this->assertDatabaseCount('library_students', 1);
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function attendanceStudent(string $studentId, string $qrcode): AttendanceStudent
    {
        return AttendanceStudent::query()->create([
            'student_id' => $studentId,
            'firstname' => 'Attendance',
            'lastname' => 'Student',
            'qrcode' => $qrcode,
            'course' => 'BSIT',
            'year' => '1',
        ]);
    }

    private function libraryStudent(string $idNumber, string $qrcode): LibraryStudent
    {
        return LibraryStudent::query()->create([
            'id_number' => $idNumber,
            'firstname' => 'Library',
            'lastname' => 'Student',
            'qrcode' => $qrcode,
            'course' => 'BSIT',
            'year' => '1',
        ]);
    }

    private function attendancePending(string $studentId): AttendancePendingStudent
    {
        return AttendancePendingStudent::query()->create([
            'student_id' => $studentId,
            'firstname' => 'Pending',
            'lastname' => 'Attendance',
            'course' => 'BSIT',
            'year' => '1',
        ]);
    }

    private function libraryPending(string $idNumber): LibraryPendingStudent
    {
        return LibraryPendingStudent::query()->create([
            'id_number' => $idNumber,
            'firstname' => 'Pending',
            'lastname' => 'Library',
            'course' => 'BSIT',
            'year' => '1',
        ]);
    }
}
