<?php

namespace Database\Seeders;

use App\Domain\Attendance\Models\AttendanceProgram;
use App\Domain\Attendance\Models\AttendanceProgramCourse;
use App\Domain\Attendance\Models\AttendanceProgramYear;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendanceProgramSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            AttendanceProgramCourse::query()->delete();
            AttendanceProgramYear::query()->delete();
            AttendanceProgram::query()->delete();

            foreach ($this->definitions() as $definition) {
                $program = AttendanceProgram::query()->create([
                    'program_code' => $definition['program_code'],
                    'program_name' => $definition['program_name'],
                    'total_years' => $definition['total_years'],
                ]);

                foreach ($definition['courses_by_year'] as $yearLevel => $courses) {
                    $year = AttendanceProgramYear::query()->create([
                        'program_id' => $program->id,
                        'year_level' => $yearLevel,
                    ]);

                    foreach ($courses as [$courseCode, $courseName]) {
                        AttendanceProgramCourse::query()->create([
                            'program_year_id' => $year->id,
                            'course_code' => $courseCode,
                            'course_name' => $courseName,
                        ]);
                    }
                }
            }
        });
    }

    /**
     * @return list<array{program_code: string, program_name: string, total_years: int, courses_by_year: array<int, list<array{0: string, 1: string}>>}>
     */
    private function definitions(): array
    {
        return [
            [
                'program_code' => 'BSCS',
                'program_name' => 'Bachelor of Science in Computer Science',
                'total_years' => 4,
                'courses_by_year' => [
                    1 => [['CS101', 'Introduction to Computing'], ['CS102', 'Computer Programming 1']],
                    2 => [['CS201', 'Computer Programming 2'], ['CS202', 'Data Structures']],
                    3 => [['CS301', 'Algorithms and Complexity'], ['CS302', 'Database Systems']],
                    4 => [['CS401', 'Software Engineering 2'], ['CS402', 'Capstone Project']],
                ],
            ],
            [
                'program_code' => 'BSIT',
                'program_name' => 'Bachelor of Science in Information Technology',
                'total_years' => 4,
                'courses_by_year' => [
                    1 => [['IT101', 'Introduction to Computing'], ['IT102', 'Programming Logic and Design']],
                    2 => [['IT201', 'Object-Oriented Programming'], ['IT202', 'Networking Fundamentals']],
                    3 => [['IT301', 'Database Management Systems'], ['IT302', 'Web Development']],
                    4 => [['IT401', 'Systems Integration'], ['IT402', 'Capstone Project']],
                ],
            ],
            [
                'program_code' => 'BSED',
                'program_name' => 'Bachelor of Secondary Education',
                'total_years' => 4,
                'courses_by_year' => [
                    1 => [['SED101', 'Foundations of Education'], ['SED102', 'Facilitating Learner-Centered Teaching']],
                    2 => [['SED201', 'Principles of Teaching'], ['SED202', 'Assessment in Learning']],
                    3 => [['SED301', 'Teaching Methods in Major Subject'], ['SED302', 'Educational Research']],
                    4 => [['SED401', 'Practice Teaching 1'], ['SED402', 'Practice Teaching 2']],
                ],
            ],
            [
                'program_code' => 'BSBA',
                'program_name' => 'Bachelor of Science in Business Administration',
                'total_years' => 4,
                'courses_by_year' => [
                    1 => [['BA101', 'Introduction to Business'], ['BA102', 'Fundamentals of Accounting 1']],
                    2 => [['BA201', 'Fundamentals of Accounting 2'], ['BA202', 'Business Communication']],
                    3 => [['BA301', 'Financial Management'], ['BA302', 'Marketing Management']],
                    4 => [['BA401', 'Strategic Management'], ['BA402', 'Business Research']],
                ],
            ],
            [
                'program_code' => 'BSA',
                'program_name' => 'Bachelor of Science in Accountancy',
                'total_years' => 4,
                'courses_by_year' => [
                    1 => [['ACCT101', 'Financial Accounting and Reporting 1'], ['ACCT102', 'Business Law and Taxation']],
                    2 => [['ACCT201', 'Financial Accounting and Reporting 2'], ['ACCT202', 'Cost Accounting']],
                    3 => [['ACCT301', 'Intermediate Accounting 1'], ['ACCT302', 'Auditing and Assurance']],
                    4 => [['ACCT401', 'Advanced Accounting'], ['ACCT402', 'Accountancy Review']],
                ],
            ],
        ];
    }
}
