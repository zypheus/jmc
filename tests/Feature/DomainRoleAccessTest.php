<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DomainRoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create([
            'email' => "{$role}.domain-access@test.test",
        ]);
        $user->assignRole($role);

        return $user;
    }

    public function test_attendance_admin_can_access_attendance_admin_features(): void
    {
        $user = $this->userWithRole('attendance_admin');

        $this->actingAs($user)->get('/attendance/logs')->assertOk();
        $this->actingAs($user)->get('/attendance/feedbacks')->assertOk();
        $this->actingAs($user)->get('/attendance/students/create')->assertOk();
    }

    public function test_attendance_admin_cannot_access_library_admin_routes(): void
    {
        $user = $this->userWithRole('attendance_admin');

        $this->actingAs($user)->get('/logs')->assertForbidden();
        $this->actingAs($user)->get('/admin/circulation-policy')->assertForbidden();
    }

    public function test_attendance_staff_cannot_access_attendance_admin_only_routes(): void
    {
        $user = $this->userWithRole('attendance_staff');

        $this->actingAs($user)->get('/attendance/logs')->assertForbidden();
        $this->actingAs($user)->get('/attendance/feedbacks')->assertForbidden();
        $this->actingAs($user)->get('/attendance/students/create')->assertForbidden();
    }

    public function test_library_admin_can_access_library_admin_features(): void
    {
        $user = $this->userWithRole('library_admin');

        $this->actingAs($user)->get('/logs')->assertOk();
        $this->actingAs($user)->get('/admin/circulation-policy')->assertOk();
        $this->actingAs($user)->get('/rooms/pending')->assertOk();
    }

    public function test_library_admin_cannot_access_attendance_admin_routes(): void
    {
        $user = $this->userWithRole('library_admin');

        $this->actingAs($user)->get('/attendance/logs')->assertForbidden();
        $this->actingAs($user)->get('/attendance/feedbacks')->assertForbidden();
        $this->actingAs($user)->get('/attendance/change-video')->assertForbidden();
        $this->actingAs($user)->get('/attendance/logout-feedback')->assertForbidden();
        $this->actingAs($user)->get('/attendance/students/create')->assertForbidden();
    }

    public function test_super_admin_can_access_both_modules(): void
    {
        $user = $this->userWithRole('super_admin');

        $this->actingAs($user)->get('/attendance/logs')->assertOk();
        $this->actingAs($user)->get('/logs')->assertOk();
        $this->actingAs($user)->get('/dashboard/attendance-admin')->assertOk();
        $this->actingAs($user)->get('/dashboard/library-admin')->assertOk();
    }

    public function test_guests_are_redirected_from_staff_routes(): void
    {
        $this->get('/attendance/logs')->assertRedirect(route('login'));
        $this->get('/logs')->assertRedirect(route('login'));
    }

    public function test_library_staff_can_access_non_admin_library_routes(): void
    {
        $user = $this->userWithRole('library_staff');

        $this->actingAs($user)->get('/books')->assertOk();
        $this->actingAs($user)->get('/catalog/copy/openlibrary')->assertOk();
        $this->actingAs($user)->get('/reports/library-holdings')->assertOk();
    }

    public function test_library_staff_cannot_access_library_admin_patron_routes(): void
    {
        $user = $this->userWithRole('library_staff');

        $this->actingAs($user)->get('/students')->assertForbidden();
        $this->actingAs($user)->get('/employees')->assertForbidden();
        $this->actingAs($user)->get('/logs')->assertForbidden();
    }

    public function test_attendance_staff_cannot_access_library_patron_directories(): void
    {
        $user = $this->userWithRole('attendance_staff');

        $this->actingAs($user)->get('/students')->assertForbidden();
        $this->actingAs($user)->get('/employees')->assertForbidden();
    }

    public function test_attendance_staff_can_access_attendance_patron_directories(): void
    {
        $user = $this->userWithRole('attendance_staff');

        $this->actingAs($user)->get('/attendance/students')->assertOk();
        $this->actingAs($user)->get('/attendance/employees')->assertOk();
    }

    public function test_library_admin_cannot_access_attendance_patron_directories(): void
    {
        $user = $this->userWithRole('library_admin');

        $this->actingAs($user)->get('/attendance/students')->assertForbidden();
        $this->actingAs($user)->get('/attendance/employees')->assertForbidden();
    }
}
