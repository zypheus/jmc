<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AttendanceInertiaPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    private function attendanceAdmin(): User
    {
        $user = User::factory()->create(['email' => 'att-admin-inertia@test.test']);
        $user->assignRole('attendance_admin');

        return $user;
    }

    private function attendanceStaff(): User
    {
        $user = User::factory()->create(['email' => 'att-staff-inertia@test.test']);
        $user->assignRole('attendance_staff');

        return $user;
    }

    /** @return array<string, array{0: string, 1: string}> */
    public static function attendanceAdminPagesProvider(): array
    {
        return [
            'dashboard admin' => ['/dashboard/attendance-admin', 'Dashboard/AttendanceAdmin'],
            'attendance logs' => ['/attendance/logs', 'Attendance/Logs/Index'],
            'feedback index' => ['/attendance/feedbacks', 'Attendance/Feedbacks/Index'],
            'students index' => ['/attendance/students', 'Attendance/Students/Index'],
            'students create' => ['/attendance/students/create', 'Attendance/Students/Create'],
            'employees index' => ['/attendance/employees', 'Attendance/Employees/Index'],
            'change video' => ['/attendance/change-video', 'Attendance/Settings/ChangeVideo'],
            'section picker' => ['/attendance/section-picker', 'Attendance/Settings/SectionPicker'],
            'logout feedback settings' => ['/attendance/logout-feedback', 'Attendance/Settings/Feedback'],
            'sms blast' => ['/attendance/sms-blast', 'Attendance/Sms/Blast'],
            'scan message' => ['/attendance/sms/scan-message', 'Attendance/Sms/ScanMessage'],
            'pending queue' => ['/attendance/pending', 'Attendance/Pending/Index'],
        ];
    }

    #[DataProvider('attendanceAdminPagesProvider')]
    public function test_attendance_admin_can_load_inertia_pages(string $url, string $component): void
    {
        $response = $this->actingAs($this->attendanceAdmin())->get($url);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component($component));
    }

    public function test_attendance_staff_dashboard_loads(): void
    {
        $response = $this->actingAs($this->attendanceStaff())->get('/dashboard/attendance-staff');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component('Dashboard/AttendanceStaff'));
    }

    public function test_attendance_kiosk_is_public(): void
    {
        $this->get('/attendance')->assertOk();
    }

    public function test_library_patron_routes_are_not_accessible_from_attendance_staff(): void
    {
        $user = $this->attendanceStaff();

        $this->actingAs($user)->get('/students')->assertForbidden();
        $this->actingAs($user)->get('/employees')->assertForbidden();
        $this->actingAs($user)->get('/logs')->assertForbidden();
    }
}
