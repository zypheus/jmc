<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class StorePendingStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'middle_initial' => ['nullable', 'string', 'max:255'],
            'student_id' => ['nullable', 'string', 'max:255'],
            'mobile_number' => ['nullable', 'string', 'max:255'],
            'course' => ['required', 'string', 'max:255'],
            'year' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'blood_type' => ['nullable', 'string', 'max:5'],
            'emergency_person' => ['nullable', 'string', 'max:255'],
            'emergency_relationship' => ['nullable', 'string', 'max:255'],
            'emergency_number' => ['nullable', 'string', 'max:255'],
            'emergency_address' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'profile_picture' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
            'student_signature' => ['nullable', 'string'],
        ];
    }
}
