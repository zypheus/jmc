<?php

namespace Database\Seeders;

use App\Domain\Attendance\Models\AttendanceStudent;
use Illuminate\Database\Seeder;

class AttendanceStudentSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->students() as $student) {
            $student['normalized_name'] = $this->normalizeName(
                trim(($student['firstname'] ?? '').' '.($student['lastname'] ?? ''))
            );

            AttendanceStudent::query()->updateOrCreate(
                ['student_id' => $student['student_id']],
                $student
            );
        }
    }

    /**
     * @return list<array<string, string|null>>
     */
    private function students(): array
    {
        return [
            ['student_id' => '2024-00001', 'firstname' => 'Juan', 'lastname' => 'Dela Cruz', 'middle_initial' => 'M', 'course' => 'BSCS', 'year' => '3rd Year', 'mobile_number' => '09171234501', 'birth_date' => '2002-03-15', 'qrcode' => 'AS-00000001'],
            ['student_id' => '2024-00002', 'firstname' => 'Maria', 'lastname' => 'Santos', 'middle_initial' => 'L', 'course' => 'BSIT', 'year' => '2nd Year', 'mobile_number' => '09181234502', 'birth_date' => '2003-07-22', 'qrcode' => 'AS-00000002'],
            ['student_id' => '2024-00003', 'firstname' => 'Jose', 'lastname' => 'Reyes', 'middle_initial' => null, 'course' => 'BSED', 'year' => '4th Year', 'mobile_number' => '09191234503', 'birth_date' => '2001-11-08', 'qrcode' => 'AS-00000003'],
            ['student_id' => '2024-00004', 'firstname' => 'Ana', 'lastname' => 'Garcia', 'middle_initial' => 'P', 'course' => 'BSBA', 'year' => '1st Year', 'mobile_number' => '09201234504', 'birth_date' => '2005-01-30', 'qrcode' => 'AS-00000004'],
            ['student_id' => '2024-00005', 'firstname' => 'Mark', 'lastname' => 'Lopez', 'middle_initial' => 'D', 'course' => 'BSA', 'year' => '3rd Year', 'mobile_number' => '09211234505', 'birth_date' => '2002-09-12', 'qrcode' => 'AS-00000005'],
        ];
    }

    private function normalizeName(string $name): string
    {
        $value = preg_replace('/[^a-z0-9]+/i', ' ', strtolower($name));

        return trim($value ?? '');
    }
}
