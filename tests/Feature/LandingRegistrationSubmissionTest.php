<?php

namespace Tests\Feature;

use Database\Seeders\LibraryRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingRegistrationSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_attendance_student_registration_can_be_submitted(): void
    {
        $this->post(route('attendance.register.student.store'), [
            'firstname' => 'Ana',
            'lastname' => 'Santos',
            'student_id' => 'A-1001',
            'course' => 'BSIT',
            'year' => '1st',
        ])
            ->assertRedirect('/')
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('attendance_pending_students', [
            'firstname' => 'Ana',
            'lastname' => 'Santos',
            'student_id' => 'A-1001',
            'course' => 'BSIT',
        ]);
    }

    public function test_attendance_employee_registration_can_be_submitted(): void
    {
        $this->post(route('attendance.register.employee.store'), [
            'firstname' => 'Ben',
            'lastname' => 'Reyes',
            'department' => 'Library',
            'position' => 'Assistant',
            'employee_id' => 'EMP-1001',
            'tin_id_number' => '123',
            'philhealth_number' => '456',
            'sss_number' => '789',
            'hdmf_number' => '101',
            'emergency_contact_name' => 'Maria Reyes',
            'emergency_contact_relationship' => 'Spouse',
            'emergency_contact_number' => '09171234567',
        ])
            ->assertRedirect('/')
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('attendance_pending_employees', [
            'firstname' => 'Ben',
            'lastname' => 'Reyes',
            'employee_id' => 'EMP-1001',
            'tin_id_number' => '123',
            'emergency_contact_name' => 'Maria Reyes',
        ]);
    }

    public function test_library_student_registration_can_be_submitted(): void
    {
        $this->post(route('library.register.student.store'), [
            'firstname' => 'Carla',
            'lastname' => 'Dela Cruz',
            'id_number' => 'LIB-S-1001',
            'course' => 'BSCS',
            'year' => '2nd',
            'email' => 'carla@example.test',
        ])
            ->assertRedirect('/')
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('library_pending_students', [
            'firstname' => 'Carla',
            'lastname' => 'Dela Cruz',
            'id_number' => 'LIB-S-1001',
            'course' => 'BSCS',
            'year' => '2nd',
            'email' => 'carla@example.test',
        ]);
    }

    public function test_library_employee_registration_can_be_submitted(): void
    {
        $this->seed(LibraryRoleSeeder::class);

        $this->post(route('library.register.employee.store'), [
            'firstname' => 'Dino',
            'lastname' => 'Garcia',
            'employee_id' => 'LIB-E-1001',
            'designation' => 'Instructor I',
            'program' => 'CICT',
            'year_start_work' => '2024',
            'birth_date' => '1995-01-15',
            'emergency_contact_name' => 'Lina Garcia',
            'emergency_contact_relationship' => 'Mother',
            'emergency_contact_number' => '09179876543',
        ])
            ->assertRedirect('/')
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('library_pending_employees', [
            'firstname' => 'Dino',
            'lastname' => 'Garcia',
            'employee_id' => 'LIB-E-1001',
            'designation' => 'Instructor I',
            'program' => 'CICT',
            'year_start_work' => '2024',
            'emergency_contact_name' => 'Lina Garcia',
        ]);
    }
}
