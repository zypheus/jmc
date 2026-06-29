<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

    public function test_module_admin_staff_creation_is_audited_under_that_module(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('library_admin');

        $this->actingAs($admin)->post(route('staff-users.store'), [
            'fname' => 'Library',
            'lname' => 'Assistant',
            'email' => 'library-assistant@example.test',
            'password' => 'password',
            'roles' => ['library_staff'],
        ])->assertRedirect(route('staff-users.index'));

        $this->assertDatabaseHas('admin_activities', [
            'module' => 'library',
            'title' => 'Staff account created',
        ]);
    }

    public function test_super_admin_can_create_a_dual_module_staff_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');

        $this->actingAs($admin)->post(route('staff-users.store'), [
            'fname' => 'Dual',
            'lname' => 'Staff',
            'email' => 'dual-staff@example.test',
            'password' => 'password',
            'roles' => ['attendance_staff', 'library_staff'],
        ])->assertRedirect(route('staff-users.index'));

        $staff = User::query()->where('email', 'dual-staff@example.test')->firstOrFail();
        $this->assertTrue($staff->hasAllRoles(['attendance_staff', 'library_staff']));
        $this->assertDatabaseHas('admin_activities', [
            'module' => 'super-admin',
            'type' => 'user',
            'title' => 'Staff account created',
        ]);
    }

    public function test_super_admin_role_cannot_be_combined_with_module_roles(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');

        $this->actingAs($admin)->post(route('staff-users.store'), [
            'fname' => 'Invalid',
            'lname' => 'Combination',
            'email' => 'invalid-combination@example.test',
            'password' => 'password',
            'roles' => ['super_admin', 'library_admin'],
        ])->assertSessionHasErrors('roles');

        $this->assertDatabaseMissing('users', ['email' => 'invalid-combination@example.test']);
    }

    public function test_super_admin_can_remove_one_module_role_without_deleting_account(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        $staff = User::factory()->create();
        $staff->assignRole(['attendance_staff', 'library_staff']);

        $this->actingAs($admin)->put(route('staff-users.update', $staff), [
            'fname' => $staff->fname,
            'lname' => $staff->lname,
            'email' => $staff->email,
            'password' => 'new-password',
            'roles' => ['library_staff'],
            'is_active' => true,
        ])->assertRedirect(route('staff-users.index'));

        $this->assertDatabaseHas('users', ['id' => $staff->id]);
        $this->assertTrue($staff->fresh()->hasRole('library_staff'));
        $this->assertFalse($staff->fresh()->hasRole('attendance_staff'));
        $this->assertTrue(Hash::check('new-password', $staff->fresh()->password));
        $this->assertDatabaseHas('admin_activities', [
            'module' => 'super-admin',
            'title' => 'Staff roles changed',
            'subject_id' => $staff->id,
        ]);
        $this->assertDatabaseHas('admin_activities', [
            'module' => 'super-admin',
            'title' => 'Staff password reset',
            'subject_id' => $staff->id,
        ]);
    }

    public function test_module_admin_preserves_roles_from_other_modules(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('library_admin');
        $staff = User::factory()->create();
        $staff->assignRole(['attendance_staff', 'library_staff']);

        $this->actingAs($admin)->put(route('staff-users.update', $staff), [
            'fname' => $staff->fname,
            'lname' => $staff->lname,
            'email' => $staff->email,
            'password' => '',
            'roles' => ['library_staff'],
            'is_active' => true,
        ])->assertRedirect(route('staff-users.index'));

        $this->assertTrue($staff->fresh()->hasAllRoles(['attendance_staff', 'library_staff']));
    }

    public function test_dual_module_admin_management_uses_the_active_module(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(['library_admin', 'attendance_admin']);

        $this->actingAs($admin)
            ->withSession(['active_module' => 'attendance'])
            ->get(route('staff-users.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('actingRole', 'attendance_admin')
                ->where('manageableRoles.0', 'attendance_staff')
            );
    }

    public function test_module_admin_cannot_deactivate_or_delete_a_cross_module_account(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('library_admin');
        $staff = User::factory()->create();
        $staff->assignRole(['library_staff', 'attendance_staff']);

        $this->actingAs($admin)
            ->patch(route('staff-users.status.update', $staff), ['is_active' => false])
            ->assertSessionHasErrors('is_active');

        $this->actingAs($admin)
            ->delete(route('staff-users.destroy', $staff))
            ->assertSessionHasErrors('roles');

        $this->assertTrue($staff->fresh()->is_active);
        $this->assertTrue($staff->fresh()->hasAllRoles(['library_staff', 'attendance_staff']));
    }

    public function test_staff_account_can_be_deactivated(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        $staff = User::factory()->create();
        $staff->assignRole('library_staff');

        $this->actingAs($admin)
            ->patch(route('staff-users.status.update', $staff), ['is_active' => false])
            ->assertRedirect();

        $this->assertFalse($staff->fresh()->is_active);
        $this->assertDatabaseHas('admin_activities', [
            'module' => 'super-admin',
            'title' => 'Staff account deactivated',
        ]);
    }

    public function test_last_active_super_admin_cannot_be_deactivated_or_demoted(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');

        $this->actingAs($admin)
            ->patch(route('staff-users.status.update', $admin), ['is_active' => false])
            ->assertSessionHasErrors('is_active');

        $this->actingAs($admin)->put(route('staff-users.update', $admin), [
            'fname' => $admin->fname,
            'lname' => $admin->lname,
            'email' => $admin->email,
            'password' => '',
            'roles' => ['library_admin'],
            'is_active' => true,
        ])->assertSessionHasErrors('roles');

        $this->assertTrue($admin->fresh()->is_active);
        $this->assertTrue($admin->fresh()->hasRole('super_admin'));
    }
}
