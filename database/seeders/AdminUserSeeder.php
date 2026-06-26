<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /** @var array<string, array{fname: string, lname: string, email: string, role: string}> */
    private const USERS = [
        'library_admin' => [
            'fname' => 'Library',
            'lname' => 'Admin',
            'email' => 'library_admin@jmc.test',
            'role' => 'library_admin',
        ],
        'library_staff' => [
            'fname' => 'Library',
            'lname' => 'Staff',
            'email' => 'library_staff@jmc.test',
            'role' => 'library_staff',
        ],
        'attendance_admin' => [
            'fname' => 'Attendance',
            'lname' => 'Admin',
            'email' => 'attendance_admin@jmc.test',
            'role' => 'attendance_admin',
        ],
        'attendance_staff' => [
            'fname' => 'Attendance',
            'lname' => 'Staff',
            'email' => 'attendance_staff@jmc.test',
            'role' => 'attendance_staff',
        ],
        'super_admin' => [
            'fname' => 'Super',
            'lname' => 'Admin',
            'email' => 'super_admin@jmc.test',
            'role' => 'super_admin',
        ],
    ];

    public function run(): void
    {
        foreach (self::USERS as $userData) {
            $user = User::query()->updateOrCreate(
                ['email' => $userData['email']],
                [
                    'fname' => $userData['fname'],
                    'lname' => $userData['lname'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ],
            );

            $user->syncRoles([$userData['role']]);
        }
    }
}
