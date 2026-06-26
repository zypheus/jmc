<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminUserSeeder::class,
            MarcFrameworkSeeder::class,
            LibraryRoleSeeder::class,
            LibraryProspectusSeeder::class,
            AttendanceProgramSeeder::class,
            LibraryFineAndSettingsSeeder::class,
            AttendanceSettingsSeeder::class,
            LibraryStudentSampleSeeder::class,
            LibraryEmployeeSampleSeeder::class,
            LibraryBookSampleSeeder::class,
            LibraryCirculationSampleSeeder::class,
            AttendanceStudentSeeder::class,
            AttendanceEmployeeSeeder::class,
            AttendanceLogSampleSeeder::class,
            LibraryFeedbackSampleSeeder::class,
            AttendanceFeedbackSampleSeeder::class,
            LibraryRoomSeeder::class,
        ]);
    }
}
