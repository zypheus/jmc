<?php

namespace App\Http\Middleware;

use App\Domain\Library\Services\LibraryNavigationStatusService;
use App\Domain\Library\Support\AdminShell;
use App\Services\Auth\ModuleAccessService;
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
        $permissions = $user?->getAllPermissions()->pluck('name')->values()->all() ?? [];
        $moduleAccess = app(ModuleAccessService::class);
        $availableModules = $user ? $moduleAccess->availableModules($user) : [];
        $activeModule = $request->session()->get('active_module');

        if ($user && $moduleAccess->isSuperAdmin($user) && $request->routeIs('super-admin.*')) {
            $activeModule = 'super-admin';
        } elseif (! is_string($activeModule) || ! in_array($activeModule, $availableModules, true)) {
            $activeModule = null;
        }
        $initials = $user
            ? strtoupper(substr((string) $user->fname, 0, 1).substr((string) $user->lname, 0, 1))
            : '';
        $libraryNavigationStatus = app(LibraryNavigationStatusService::class);

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
                    'permissions' => $permissions,
                    'role' => $primaryRole,
                    'isAdmin' => $user->hasAnyRole(['library_admin', 'attendance_admin', 'super_admin']),
                    'initials' => $initials ?: 'U',
                    'avatarUrl' => $user->profile_picture ? asset($user->profile_picture) : null,
                ] : null,
                'availableModules' => $availableModules,
                'activeModule' => $activeModule,
                'isSuperAdmin' => $user ? $moduleAccess->isSuperAdmin($user) : false,
            ],
            'routeName' => fn () => $request->route()?->getName(),
            'adminActivity' => fn () => AdminShell::adminActivity($user),
            'libraryNavigationStatus' => fn () => $libraryNavigationStatus->canView($user)
                ? [
                    'counts' => $libraryNavigationStatus->counts(),
                    'refreshUrl' => route('library.navigation.status'),
                ]
                : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'lookup_status' => fn () => $request->session()->get('lookup_status'),
            ],
            'branding' => [
                'blue' => '#1f4ea7',
                'green' => '#2e7d32',
                'gold' => '#ffd700',
            ],
        ];
    }
}
