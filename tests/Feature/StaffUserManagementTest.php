<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StaffUserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_super_admin_can_view_staff_users(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');

        $this->actingAs($admin)
            ->get(route('staff-users.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Auth/StaffUsers/Index'));
    }

    public function test_library_staff_cannot_manage_staff_users(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('library_staff');

        $this->actingAs($staff)
            ->get(route('staff-users.index'))
            ->assertForbidden();
    }

    public function test_library_admin_can_only_assign_library_staff_role(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('library_admin');

        $this->actingAs($admin)
            ->get(route('staff-users.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Auth/StaffUsers/Create')
                ->has('manageableRoles', 1)
                ->where('manageableRoles.0', 'library_staff')
            );
    }
}
