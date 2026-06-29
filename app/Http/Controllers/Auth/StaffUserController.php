<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Domain\Library\Models\AdminActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\StoreStaffUserRequest;
use App\Http\Requests\Auth\UpdateStaffUserRequest;
use App\Models\User;
use App\Services\Shared\AuditLogService;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class StaffUserController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLog) {}

    public function index(Request $request): Response
    {
        $actingRole = $this->actingRole($request);
        $manageableRoles = $this->manageableRoles($actingRole);

        $users = User::query()
            ->role($manageableRoles)
            ->with('roles')
            ->orderBy('lname')
            ->orderBy('fname')
            ->paginate(15)
            ->through(fn (User $user): array => $this->formatUser($user));

        return Inertia::render('Auth/StaffUsers/Index', [
            'users' => $users,
            'manageableRoles' => $manageableRoles,
            'actingRole' => $actingRole,
        ]);
    }

    public function create(Request $request): Response
    {
        $actingRole = $this->actingRole($request);

        return Inertia::render('Auth/StaffUsers/Create', [
            'manageableRoles' => $this->manageableRoles($actingRole),
            'actingRole' => $actingRole,
        ]);
    }

    public function store(StoreStaffUserRequest $request): RedirectResponse
    {
        $actingRole = $this->actingRole($request);
        $validated = $request->validated();
        $roles = $this->validatedRoleSelection($validated['roles'], $actingRole);

        $user = DB::transaction(function () use ($validated, $roles, $actingRole): User {
            $user = User::query()->create([
                'fname' => $validated['fname'],
                'lname' => $validated['lname'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now(),
                'is_active' => true,
            ]);

            $user->syncRoles($roles);

            $this->auditLog->record(
                $this->auditModule($actingRole),
                AdminActivity::TYPE_USER,
                'Staff account created',
                $user->full_name.' — '.implode(', ', $roles),
                route('staff-users.edit', $user),
                'staff',
                $user,
            );

            return $user;
        });

        return redirect()
            ->route('staff-users.index')
            ->with('success', "{$user->full_name} was created successfully.");
    }

    public function edit(Request $request, User $staffUser): Response
    {
        $actingRole = $this->actingRole($request);
        $this->ensureCanManageUser($actingRole, $staffUser);

        return Inertia::render('Auth/StaffUsers/Edit', [
            'staffUser' => $this->formatUser($staffUser),
            'manageableRoles' => $this->manageableRoles($actingRole),
            'actingRole' => $actingRole,
        ]);
    }

    public function update(UpdateStaffUserRequest $request, User $staffUser): RedirectResponse
    {
        $actingRole = $this->actingRole($request);
        $this->ensureCanManageUser($actingRole, $staffUser);
        $validated = $request->validated();
        $submittedRoles = $this->validatedRoleSelection($validated['roles'], $actingRole);
        $roles = $this->rolesAfterUpdate($staffUser, $submittedRoles, $actingRole);
        $isActive = (bool) $validated['is_active'];

        $this->guardCrossModuleStatusChange($staffUser, $actingRole, $isActive);
        $this->guardLastActiveSuperAdmin($staffUser, $roles, $isActive);

        DB::transaction(function () use ($staffUser, $validated, $roles, $isActive, $actingRole): void {
            $previousRoles = $staffUser->getRoleNames()->values()->all();
            $wasActive = $staffUser->is_active;
            $passwordWasReset = filled($validated['password']);
            $module = $this->auditModule($actingRole);

            $staffUser->update([
                'fname' => $validated['fname'],
                'lname' => $validated['lname'],
                'email' => $validated['email'],
                'is_active' => $isActive,
                ...($validated['password'] ? ['password' => Hash::make($validated['password'])] : []),
            ]);
            $staffUser->syncRoles($roles);

            $changes = [
                'roles: '.implode(', ', $previousRoles).' → '.implode(', ', $roles),
                'status: '.($wasActive ? 'active' : 'inactive').' → '.($isActive ? 'active' : 'inactive'),
            ];

            $this->auditLog->record(
                $module,
                AdminActivity::TYPE_USER,
                'Staff account updated',
                $staffUser->full_name,
                route('staff-users.edit', $staffUser),
                'staff',
                $staffUser,
            );

            if ($previousRoles !== $roles) {
                $this->auditLog->record(
                    $module,
                    AdminActivity::TYPE_USER,
                    'Staff roles changed',
                    implode(', ', $previousRoles).' -> '.implode(', ', $roles),
                    route('staff-users.edit', $staffUser),
                    'staff',
                    $staffUser,
                );
            }

            if ($passwordWasReset) {
                $this->auditLog->record(
                    $module,
                    AdminActivity::TYPE_USER,
                    'Staff password reset',
                    $staffUser->full_name,
                    route('staff-users.edit', $staffUser),
                    'staff',
                    $staffUser,
                );
            }

            if ($wasActive !== $isActive) {
                $this->auditLog->record(
                    $module,
                    AdminActivity::TYPE_USER,
                    $isActive ? 'Staff account activated' : 'Staff account deactivated',
                    $staffUser->full_name,
                    route('staff-users.edit', $staffUser),
                    'staff',
                    $staffUser,
                );
            }
        });

        return redirect()
            ->route('staff-users.index')
            ->with('success', 'Staff user updated successfully.');
    }

    public function updateStatus(Request $request, User $staffUser): RedirectResponse
    {
        $actingRole = $this->actingRole($request);
        $this->ensureCanManageUser($actingRole, $staffUser);
        $validated = $request->validate(['is_active' => ['required', 'boolean']]);
        $isActive = (bool) $validated['is_active'];

        if ($staffUser->is($request->user()) && ! $isActive) {
            throw ValidationException::withMessages([
                'is_active' => 'You cannot deactivate your own account.',
            ]);
        }

        $this->guardCrossModuleStatusChange($staffUser, $actingRole, $isActive);
        $roles = $staffUser->getRoleNames()->values()->all();
        $this->guardLastActiveSuperAdmin($staffUser, $roles, $isActive);

        DB::transaction(function () use ($staffUser, $isActive, $actingRole): void {
            $staffUser->update(['is_active' => $isActive]);

            $this->auditLog->record(
                $this->auditModule($actingRole),
                AdminActivity::TYPE_USER,
                $isActive ? 'Staff account activated' : 'Staff account deactivated',
                $staffUser->full_name,
                route('staff-users.edit', $staffUser),
                'staff',
                $staffUser,
            );
        });

        return back()->with('success', $isActive ? 'Staff account activated.' : 'Staff account deactivated.');
    }

    public function destroy(Request $request, User $staffUser): RedirectResponse
    {
        $actingRole = $this->actingRole($request);
        $this->ensureCanManageUser($actingRole, $staffUser);

        if ($staffUser->is($request->user())) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $this->guardCrossModuleDeletion($staffUser, $actingRole);
        $this->guardLastActiveSuperAdmin($staffUser, [], false);

        DB::transaction(function () use ($staffUser, $actingRole): void {
            $this->auditLog->record(
                $this->auditModule($actingRole),
                AdminActivity::TYPE_USER,
                'Staff account deleted',
                $staffUser->full_name,
                null,
                'staff',
                $staffUser,
            );

            $staffUser->delete();
        });

        return redirect()
            ->route('staff-users.index')
            ->with('success', 'Staff user deleted successfully.');
    }

    private function actingRole(Request $request): string
    {
        $user = $request->user();

        if ($user->hasRole('super_admin')) {
            return 'super_admin';
        }

        $activeModule = $request->session()->get('active_module');
        if ($activeModule === 'attendance' && $user->hasRole('attendance_admin')) {
            return 'attendance_admin';
        }
        if ($activeModule === 'library' && $user->hasRole('library_admin')) {
            return 'library_admin';
        }

        foreach (['library_admin', 'attendance_admin'] as $role) {
            if ($user->hasRole($role)) {
                return $role;
            }
        }

        abort(403, 'You are not authorized to manage staff users.');
    }

    private function auditModule(string $actingRole): string
    {
        return match ($actingRole) {
            'library_admin' => 'library',
            'attendance_admin' => 'attendance',
            default => 'super-admin',
        };
    }

    /** @return list<string> */
    private function manageableRoles(string $actingRole): array
    {
        return match ($actingRole) {
            'super_admin' => RoleSeeder::ROLES,
            'library_admin' => ['library_staff'],
            'attendance_admin' => ['attendance_staff'],
            default => abort(403, 'You are not authorized to manage staff users.'),
        };
    }

    /**
     * @param  list<string>  $roles
     * @return list<string>
     */
    private function validatedRoleSelection(array $roles, string $actingRole): array
    {
        $roles = array_values(array_unique($roles));
        $manageableRoles = $this->manageableRoles($actingRole);

        if (array_diff($roles, $manageableRoles) !== []) {
            throw ValidationException::withMessages([
                'roles' => 'One or more selected roles cannot be assigned by your account.',
            ]);
        }

        if ($actingRole !== 'super_admin' && count($roles) !== 1) {
            throw ValidationException::withMessages([
                'roles' => 'Module administrators must assign their module staff role.',
            ]);
        }

        if (in_array('super_admin', $roles, true) && count($roles) > 1) {
            throw ValidationException::withMessages([
                'roles' => 'The Super Administrator role cannot be combined with module roles.',
            ]);
        }

        return $roles;
    }

    /**
     * @param  list<string>  $submittedRoles
     * @return list<string>
     */
    private function rolesAfterUpdate(User $staffUser, array $submittedRoles, string $actingRole): array
    {
        if ($actingRole === 'super_admin') {
            return $submittedRoles;
        }

        $preservedRoles = $staffUser->getRoleNames()
            ->reject(fn (string $role): bool => in_array($role, $this->manageableRoles($actingRole), true))
            ->values()
            ->all();

        return array_values(array_unique([...$preservedRoles, ...$submittedRoles]));
    }

    private function ensureCanManageUser(string $actingRole, User $staffUser): void
    {
        if ($actingRole === 'super_admin') {
            abort_unless($staffUser->hasAnyRole(RoleSeeder::ROLES), 403);

            return;
        }

        abort_if($staffUser->hasRole('super_admin'), 403);
        abort_unless($staffUser->hasAnyRole($this->manageableRoles($actingRole)), 403);
    }

    private function guardCrossModuleStatusChange(User $staffUser, string $actingRole, bool $isActive): void
    {
        if ($actingRole === 'super_admin' || $staffUser->is_active === $isActive) {
            return;
        }

        $unrelatedRoles = $staffUser->getRoleNames()
            ->reject(fn (string $role): bool => in_array($role, $this->manageableRoles($actingRole), true));

        if ($unrelatedRoles->isNotEmpty()) {
            throw ValidationException::withMessages([
                'is_active' => 'Only a Super Administrator can change the status of a cross-module account.',
            ]);
        }
    }

    private function guardCrossModuleDeletion(User $staffUser, string $actingRole): void
    {
        if ($actingRole === 'super_admin') {
            return;
        }

        $unrelatedRoles = $staffUser->getRoleNames()
            ->reject(fn (string $role): bool => in_array($role, $this->manageableRoles($actingRole), true));

        if ($unrelatedRoles->isNotEmpty()) {
            throw ValidationException::withMessages([
                'roles' => 'Only a Super Administrator can delete a cross-module account.',
            ]);
        }
    }

    /** @param list<string> $nextRoles */
    private function guardLastActiveSuperAdmin(User $staffUser, array $nextRoles, bool $willBeActive): void
    {
        if (! $staffUser->hasRole('super_admin') || (in_array('super_admin', $nextRoles, true) && $willBeActive)) {
            return;
        }

        $activeSuperAdmins = User::query()
            ->role('super_admin')
            ->where('is_active', true)
            ->count();

        if ($staffUser->is_active && $activeSuperAdmins <= 1) {
            throw ValidationException::withMessages([
                'roles' => 'The last active Super Administrator cannot be removed or deactivated.',
            ]);
        }
    }

    /** @return array<string, mixed> */
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'fname' => $user->fname,
            'lname' => $user->lname,
            'fullName' => $user->full_name,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->values()->all(),
            'isActive' => $user->is_active,
        ];
    }
}
