<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /** @var list<string> */
    public const ROLES = [
        'library_admin',
        'library_staff',
        'attendance_admin',
        'attendance_staff',
        'super_admin',
    ];

    public function run(): void
    {
        foreach (self::ROLES as $role) {
            Role::findOrCreate($role, 'web');
        }
    }
}
