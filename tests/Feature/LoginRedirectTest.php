<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
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
            'library admin' => ['library_admin', 'library.dashboard.admin'],
            'library staff' => ['library_staff', 'library.dashboard.staff'],
            'attendance admin' => ['attendance_admin', 'attendance.dashboard.admin'],
            'attendance staff' => ['attendance_staff', 'attendance.dashboard.staff'],
            'super admin' => ['super_admin', 'super-admin.dashboard'],
        ];
    }

    #[DataProvider('roleDashboardProvider')]
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

    public function test_logout_redirects_to_home_with_status_message(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('logout'))
            ->assertRedirect(route('home'))
            ->assertSessionHas('status', 'You have been logged out.');

        $this->assertGuest();
    }

    public function test_logout_does_not_show_page_expired_when_csrf_token_is_stale(): void
    {
        $user = User::factory()->create();

        $this->withMiddleware()
            ->actingAs($user)
            ->post(route('logout'))
            ->assertRedirect(route('home'))
            ->assertSessionHas('status', 'You have been logged out.');

        $this->assertGuest();
    }

    public function test_dual_module_user_is_redirected_to_module_selection(): void
    {
        $user = User::factory()->create(['email' => 'dual@example.test']);
        $user->assignRole(['attendance_staff', 'library_staff']);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('module.select'));

        $this->actingAs($user)
            ->get(route('module.select'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Auth/SelectModule')
                ->where('availableModules', ['attendance', 'library'])
            );
    }

    public function test_user_cannot_select_a_module_without_access(): void
    {
        $user = User::factory()->create();
        $user->assignRole('attendance_staff');

        $this->actingAs($user)
            ->post(route('module.select.store'), ['module' => 'library'])
            ->assertForbidden();
    }

    public function test_module_selection_is_stored_in_session(): void
    {
        $user = User::factory()->create();
        $user->assignRole(['attendance_staff', 'library_staff']);

        $this->actingAs($user)
            ->post(route('module.select.store'), ['module' => 'library'])
            ->assertRedirect(route('library.dashboard.staff'))
            ->assertSessionHas('active_module', 'library');
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive@example.test',
            'is_active' => false,
        ]);
        $user->assignRole('library_staff');

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_inactive_authenticated_user_is_logged_out_on_next_request(): void
    {
        $user = User::factory()->create(['is_active' => false]);
        $user->assignRole('library_staff');

        $this->actingAs($user)
            ->get('/dashboard/library-staff')
            ->assertRedirect(route('login'));

        $this->assertGuest();
    }
}
