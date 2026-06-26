<?php

namespace Database\Seeders;

use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryProgram;
use Illuminate\Database\Seeder;

class LibraryEmployeeSampleSeeder extends Seeder
{
    public function run(): void
    {
        $programNames = LibraryProgram::query()->pluck('program_name', 'program_code');

        foreach ($this->employees() as $employee) {
            $programCode = $employee['program'];
            $employee['role_id'] = 2;
            $employee['department'] = $programNames->get($programCode, $programCode);
            $employee['position'] = $employee['designation'];

            LibraryEmployee::query()->updateOrCreate(
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
            ['employee_id' => 'FAC-2024-001', 'firstname' => 'Maria', 'lastname' => 'Reyes', 'middle_initial' => 'L', 'designation' => 'Instructor I', 'program' => 'BSCS', 'year_start_work' => '2019', 'birth_date' => '1990-05-12', 'mobile_number' => '09171234001', 'address' => 'Koronadal City, South Cotabato', 'emergency_contact_name' => 'Juan Reyes', 'emergency_contact_relationship' => 'Spouse', 'emergency_contact_number' => '09181234001', 'qrcode' => 'E-00000001'],
            ['employee_id' => 'FAC-2024-002', 'firstname' => 'Pedro', 'lastname' => 'Garcia', 'middle_initial' => 'S', 'designation' => 'College Librarian', 'program' => 'BEED', 'year_start_work' => '2015', 'birth_date' => '1985-11-03', 'mobile_number' => '09171234002', 'address' => 'General Santos City', 'emergency_contact_name' => 'Ana Garcia', 'emergency_contact_relationship' => 'Sister', 'emergency_contact_number' => '09181234002', 'qrcode' => 'E-00000002'],
            ['employee_id' => 'STAFF-2024-003', 'firstname' => 'Liza', 'lastname' => 'Mendoza', 'middle_initial' => null, 'designation' => 'Library Staff', 'program' => 'BSBA', 'year_start_work' => '2022', 'birth_date' => '1998-02-20', 'mobile_number' => '09171234003', 'address' => 'Tupi, South Cotabato', 'emergency_contact_name' => 'Rosa Mendoza', 'emergency_contact_relationship' => 'Mother', 'emergency_contact_number' => '09181234003', 'qrcode' => 'E-00000003'],
            ['employee_id' => 'FAC-2024-004', 'firstname' => 'Amormio', 'lastname' => 'Redonda', 'middle_initial' => 'Z', 'designation' => 'College Librarian', 'program' => 'BSED', 'year_start_work' => '2010', 'birth_date' => '1978-08-14', 'mobile_number' => '09171234004', 'address' => 'Governor Generoso, Davao Oriental', 'emergency_contact_name' => 'Elena Redonda', 'emergency_contact_relationship' => 'Spouse', 'emergency_contact_number' => '09181234004', 'qrcode' => 'E-00000004'],
            ['employee_id' => 'FAC-2024-005', 'firstname' => 'Jandy', 'lastname' => 'Bongcayat', 'middle_initial' => 'T', 'designation' => 'Program Chair - BSED English', 'program' => 'BSED', 'year_start_work' => '2012', 'birth_date' => '1982-03-22', 'mobile_number' => '09171234005', 'address' => 'Mati City, Davao Oriental', 'emergency_contact_name' => 'Grace Bongcayat', 'emergency_contact_relationship' => 'Spouse', 'emergency_contact_number' => '09181234005', 'qrcode' => 'E-00000005'],
            ['employee_id' => 'FAC-2024-006', 'firstname' => 'Helen', 'lastname' => 'Gonzales', 'middle_initial' => 'J', 'designation' => 'Instructor II - Linguistics', 'program' => 'BSED', 'year_start_work' => '2018', 'birth_date' => '1991-01-09', 'mobile_number' => '09171234006', 'address' => 'Baganga, Davao Oriental', 'emergency_contact_name' => 'Jose Gonzales', 'emergency_contact_relationship' => 'Father', 'emergency_contact_number' => '09181234006', 'qrcode' => 'E-00000006'],
            ['employee_id' => 'FAC-2024-007', 'firstname' => 'Ricardo', 'lastname' => 'Bantawig', 'middle_initial' => 'B', 'designation' => 'Assistant Professor', 'program' => 'BSED', 'year_start_work' => '2016', 'birth_date' => '1987-07-30', 'mobile_number' => '09171234007', 'address' => 'Lupon, Davao Oriental', 'emergency_contact_name' => 'Carmen Bantawig', 'emergency_contact_relationship' => 'Spouse', 'emergency_contact_number' => '09181234007', 'qrcode' => 'E-00000007'],
            ['employee_id' => 'FAC-2024-008', 'firstname' => 'Grace', 'lastname' => 'Pawilen', 'middle_initial' => 'T', 'designation' => 'Instructor I - Literature', 'program' => 'BSED', 'year_start_work' => '2020', 'birth_date' => '1993-12-05', 'mobile_number' => '09171234008', 'address' => 'San Isidro, Davao Oriental', 'emergency_contact_name' => 'Lorna Pawilen', 'emergency_contact_relationship' => 'Mother', 'emergency_contact_number' => '09181234008', 'qrcode' => 'E-00000008'],
            ['employee_id' => 'FAC-2024-009', 'firstname' => 'Antonio', 'lastname' => 'Ancheta', 'middle_initial' => 'R', 'designation' => 'Instructor I - Prof Ed', 'program' => 'BEED', 'year_start_work' => '2017', 'birth_date' => '1989-04-18', 'mobile_number' => '09171234009', 'address' => 'Banaybanay, Davao Oriental', 'emergency_contact_name' => 'Teresa Ancheta', 'emergency_contact_relationship' => 'Spouse', 'emergency_contact_number' => '09181234009', 'qrcode' => 'E-00000010'],
            ['employee_id' => 'FAC-2024-010', 'firstname' => 'Catherine', 'lastname' => 'Mananay', 'middle_initial' => 'P', 'designation' => 'Instructor I', 'program' => 'BSIT', 'year_start_work' => '2021', 'birth_date' => '1996-09-27', 'mobile_number' => '09171234010', 'address' => 'Municipality of Caraga, Davao Oriental', 'emergency_contact_name' => 'Paul Mananay', 'emergency_contact_relationship' => 'Brother', 'emergency_contact_number' => '09181234010', 'qrcode' => 'E-00000011'],
            ['employee_id' => 'STAFF-2024-011', 'firstname' => 'Noel', 'lastname' => 'Dapat', 'middle_initial' => null, 'designation' => 'Library Assistant', 'program' => 'BSED', 'year_start_work' => '2023', 'birth_date' => '1999-06-11', 'mobile_number' => '09171234011', 'address' => 'Governor Generoso, Davao Oriental', 'emergency_contact_name' => 'Imelda Dapat', 'emergency_contact_relationship' => 'Mother', 'emergency_contact_number' => '09181234011', 'qrcode' => 'E-00000012'],
            ['employee_id' => 'FAC-2024-012', 'firstname' => 'Marites', 'lastname' => 'Aquino', 'middle_initial' => 'V', 'designation' => 'Dean - College of Education', 'program' => 'BEED', 'year_start_work' => '2008', 'birth_date' => '1975-10-02', 'mobile_number' => '09171234012', 'address' => 'Mati City, Davao Oriental', 'emergency_contact_name' => 'Gaudencio Aquino', 'emergency_contact_relationship' => 'Spouse', 'emergency_contact_number' => '09181234012', 'qrcode' => 'E-00000013'],
        ];
    }
}
