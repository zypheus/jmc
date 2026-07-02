<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Models\User;
use InvalidArgumentException;

final class ModuleAccessService
{
    public const ATTENDANCE = 'attendance';

    public const LIBRARY = 'library';

    public const SUPER_ADMIN = 'super-admin';

    public function isSuperAdmin(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    public function hasAttendanceAccess(User $user): bool
    {
        return $this->isSuperAdmin($user)
            || $user->hasAnyRole(['attendance_admin', 'attendance_staff']);
    }

    public function hasLibraryAccess(User $user): bool
    {
        return $this->isSuperAdmin($user)
            || $user->hasAnyRole(['library_admin', 'library_staff']);
    }

    public function hasAttendanceAdminAccess(User $user): bool
    {
        return $this->isSuperAdmin($user) || $user->hasRole('attendance_admin');
    }

    public function hasLibraryAdminAccess(User $user): bool
    {
        return $this->isSuperAdmin($user) || $user->hasRole('library_admin');
    }

    /** @return list<string> */
    public function availableModules(User $user): array
    {
        $modules = [];

        if ($this->hasAttendanceAccess($user)) {
            $modules[] = self::ATTENDANCE;
        }

        if ($this->hasLibraryAccess($user)) {
            $modules[] = self::LIBRARY;
        }

        return $modules;
    }

    public function hasMultipleModules(User $user): bool
    {
        return count($this->availableModules($user)) > 1;
    }

    public function canAccessModule(User $user, string $module): bool
    {
        return match ($module) {
            self::ATTENDANCE => $this->hasAttendanceAccess($user),
            self::LIBRARY => $this->hasLibraryAccess($user),
            self::SUPER_ADMIN => $this->isSuperAdmin($user),
            default => false,
        };
    }

    public function defaultModule(User $user): string
    {
        if ($this->isSuperAdmin($user)) {
            return self::SUPER_ADMIN;
        }

        if ($this->hasAttendanceAccess($user)) {
            return self::ATTENDANCE;
        }

        if ($this->hasLibraryAccess($user)) {
            return self::LIBRARY;
        }

        throw new InvalidArgumentException('The user has no assigned staff module.');
    }

    public function defaultDashboardRoute(User $user): string
    {
        return $this->dashboardRouteForModule($user, $this->defaultModule($user));
    }

    public function dashboardRouteForModule(User $user, string $module): string
    {
        if (! $this->canAccessModule($user, $module)) {
            throw new InvalidArgumentException('The user cannot access the selected module.');
        }

        return match ($module) {
            self::SUPER_ADMIN => 'super-admin.dashboard',
            self::ATTENDANCE => $this->hasAttendanceAdminAccess($user)
                ? 'attendance.dashboard.admin'
                : 'attendance.dashboard.staff',
            self::LIBRARY => $this->hasLibraryAdminAccess($user)
                ? 'library.dashboard.admin'
                : 'library.dashboard.staff',
            default => throw new InvalidArgumentException('Unknown staff module.'),
        };
    }
}
