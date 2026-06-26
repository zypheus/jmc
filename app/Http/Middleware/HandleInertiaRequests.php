<?php

namespace App\Http\Middleware;

use App\Domain\Library\Support\AdminShell;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /** @return array<string, mixed> */
    public function share(Request $request): array
    {
        $user = $request->user();
        $roles = $user?->getRoleNames()->values()->all() ?? [];
        $primaryRole = $roles[0] ?? null;
        $initials = $user
            ? strtoupper(substr((string) $user->fname, 0, 1).substr((string) $user->lname, 0, 1))
            : '';

        return [
            ...parent::share($request),
            'auth' => fn () => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'fname' => $user->fname,
                    'lname' => $user->lname,
                    'fullName' => $user->full_name,
                    'email' => $user->email,
                    'roles' => $roles,
                    'role' => $primaryRole,
                    'isAdmin' => in_array($primaryRole, ['library_admin', 'attendance_admin', 'super_admin'], true),
                    'initials' => $initials ?: 'U',
                    'avatarUrl' => $user->profile_picture ? asset('storage/'.$user->profile_picture) : null,
                ] : null,
            ],
            'routeName' => fn () => $request->route()?->getName(),
            'adminActivity' => fn () => AdminShell::adminActivity($user),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'branding' => [
                'blue' => '#1f4ea7',
                'green' => '#2e7d32',
                'gold' => '#ffd700',
            ],
        ];
    }
}
