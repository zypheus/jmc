<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [];

    public function boot(): void
    {
        $this->registerPolicies();

        // Legacy Blade layouts (ported from USM) use these gate names.
        Gate::define('isAdmin', fn (User $user) => $user->hasAnyRole([
            'library_admin',
            'attendance_admin',
            'super_admin',
        ]));

        Gate::define('isStaff', fn (User $user) => $user->hasAnyRole([
            'library_staff',
            'attendance_staff',
        ]));

        Gate::define('isAdminOrStaff', fn (User $user) => $user->hasAnyRole([
            'library_admin',
            'library_staff',
            'attendance_admin',
            'attendance_staff',
            'super_admin',
        ]));
    }
}
