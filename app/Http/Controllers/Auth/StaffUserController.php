<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class StaffUserController extends Controller
{
    /** @var list<string> */
    private const STAFF_ROLES = [
        'library_admin',
        'library_staff',
        'attendance_admin',
        'attendance_staff',
    ];

    public function index(Request $request): Response
    {
        $actingRole = $this->actingRole($request);
        $manageableRoles = $this->manageableRoles($actingRole);

        $users = User::query()
            ->role($manageableRoles)
            ->orderBy('lname')
            ->orderBy('fname')
            ->paginate(15)
            ->through(fn (User $user) => $this->formatUser($user));

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

    public function store(Request $request): RedirectResponse
    {
        $actingRole = $this->actingRole($request);
        $manageableRoles = $this->manageableRoles($actingRole);

        $validated = $request->validate([
            'fname' => ['required', 'string', 'max:255'],
            'lname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', Rule::in($manageableRoles)],
        ]);

        $user = User::query()->create([
            'fname' => $validated['fname'],
            'lname' => $validated['lname'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        $user->assignRole($validated['role']);

        return redirect()
            ->route('staff-users.index')
            ->with('success', 'Staff user created successfully.');
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

    public function update(Request $request, User $staffUser): RedirectResponse
    {
        $actingRole = $this->actingRole($request);
        $this->ensureCanManageUser($actingRole, $staffUser);
        $manageableRoles = $this->manageableRoles($actingRole);

        $validated = $request->validate([
            'fname' => ['required', 'string', 'max:255'],
            'lname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($staffUser->id)],
            'password' => ['nullable', Password::defaults()],
            'role' => ['required', Rule::in($manageableRoles)],
        ]);

        $staffUser->update([
            'fname' => $validated['fname'],
            'lname' => $validated['lname'],
            'email' => $validated['email'],
            ...($validated['password'] ? ['password' => Hash::make($validated['password'])] : []),
        ]);

        $staffUser->syncRoles([$validated['role']]);

        return redirect()
            ->route('staff-users.index')
            ->with('success', 'Staff user updated successfully.');
    }

    public function destroy(Request $request, User $staffUser): RedirectResponse
    {
        $actingRole = $this->actingRole($request);
        $this->ensureCanManageUser($actingRole, $staffUser);

        if ($staffUser->is($request->user())) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $staffUser->delete();

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

        if ($user->hasRole('library_admin')) {
            return 'library_admin';
        }

        if ($user->hasRole('attendance_admin')) {
            return 'attendance_admin';
        }

        abort(403, 'You are not authorized to manage staff users.');
    }

    /** @return list<string> */
    private function manageableRoles(string $actingRole): array
    {
        return match ($actingRole) {
            'super_admin' => self::STAFF_ROLES,
            'library_admin' => ['library_staff'],
            'attendance_admin' => ['attendance_staff'],
            default => abort(403, 'You are not authorized to manage staff users.'),
        };
    }

    private function ensureCanManageUser(string $actingRole, User $staffUser): void
    {
        $manageableRoles = $this->manageableRoles($actingRole);

        if (! $staffUser->hasAnyRole($manageableRoles)) {
            abort(403, 'You are not authorized to manage this user.');
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
        ];
    }
}
