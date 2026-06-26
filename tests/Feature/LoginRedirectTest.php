<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginRedirectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    /** @return array<string, string> */
    public static function roleDashboardProvider(): array
    {
        return [
            'library admin' => ['library_admin', 'dashboard.library-admin'],
            'library staff' => ['library_staff', 'dashboard.library-staff'],
            'attendance admin' => ['attendance_admin', 'dashboard.attendance-admin'],
            'attendance staff' => ['attendance_staff', 'dashboard.attendance-staff'],
            'super admin' => ['super_admin', 'dashboard.super-admin'],
        ];
    }

    /** @dataProvider roleDashboardProvider */
    public function test_login_redirects_to_role_dashboard(string $role, string $routeName): void
    {
        $user = User::factory()->create([
            'email' => "{$role}@example.test",
        ]);
        $user->assignRole($role);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route($routeName));
        $this->assertAuthenticatedAs($user);
    }

    public function test_guest_is_redirected_to_login_page(): void
    {
        $response = $this->get('/login');

        $response->assertOk();
    }
}
