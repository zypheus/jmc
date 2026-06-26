<?php

namespace Database\Seeders;

use App\Domain\Attendance\Models\AttendanceEmployee;
use Illuminate\Database\Seeder;

class AttendanceEmployeeSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->employees() as $employee) {
            AttendanceEmployee::query()->updateOrCreate(
                ['employee_id' => $employee['employee_id']],
                $employee
            );
        }
    }

    /**
     * @return list<array<string, string|null>>
     */
    private function employees(): array
    {
        return [
            ['employee_id' => 'EMP-2024-001', 'employee_number' => 'EN-1001', 'firstname' => 'Rosa', 'lastname' => 'Mendoza', 'department' => 'Library Services', 'position' => 'Head Librarian', 'birth_date' => '1985-04-12', 'sex' => 'Female', 'civil_status' => 'Married', 'qrcode' => 'AE-00000001'],
            ['employee_id' => 'EMP-2024-002', 'employee_number' => 'EN-1002', 'firstname' => 'Carlos', 'lastname' => 'Villanueva', 'department' => 'Information Technology', 'position' => 'Systems Administrator', 'birth_date' => '1990-08-03', 'sex' => 'Male', 'civil_status' => 'Married', 'qrcode' => 'AE-00000002'],
            ['employee_id' => 'EMP-2024-003', 'employee_number' => 'EN-1003', 'firstname' => 'Elena', 'lastname' => 'Torres', 'department' => 'Registrar', 'position' => 'Records Officer', 'birth_date' => '1988-12-20', 'sex' => 'Female', 'civil_status' => 'Single', 'qrcode' => 'AE-00000003'],
            ['employee_id' => 'EMP-2024-004', 'employee_number' => 'EN-1004', 'firstname' => 'Miguel', 'lastname' => 'Fernandez', 'department' => 'Student Affairs', 'position' => 'Coordinator', 'birth_date' => '1992-06-15', 'sex' => 'Male', 'civil_status' => 'Single', 'qrcode' => 'AE-00000004'],
            ['employee_id' => 'EMP-2024-005', 'employee_number' => 'EN-1005', 'firstname' => 'Grace', 'lastname' => 'Bautista', 'department' => 'Library Services', 'position' => 'Circulation Staff', 'birth_date' => '1995-02-28', 'sex' => 'Female', 'civil_status' => 'Single', 'qrcode' => 'AE-00000005'],
        ];
    }
}
