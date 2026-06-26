<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_choice_page_is_accessible(): void
    {
        $this->get(route('register.choice'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Register/Choice'));
    }

    public function test_attendance_student_registration_form_is_accessible(): void
    {
        $this->get(route('attendance.register.student.form'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Register/Attendance/Student'));
    }

    public function test_library_student_registration_form_is_accessible(): void
    {
        $this->get(route('library.register.student.form'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Register/Library/Student'));
    }

    public function test_attendance_kiosk_is_public(): void
    {
        $this->get(route('attendance.scan'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Attendance/Scan'));
    }
}
