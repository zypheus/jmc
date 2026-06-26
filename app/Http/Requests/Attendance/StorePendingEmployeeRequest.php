<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class StorePendingEmployeeRequest extends FormRequest
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
            'department' => ['required', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'employee_id' => ['required', 'string', 'max:255', 'unique:attendance_pending_employees,employee_id'],
            'birth_date' => ['nullable', 'date'],
            'sex' => ['nullable', 'string', 'max:20'],
            'civil_status' => ['nullable', 'string', 'max:50'],
            'blood_type' => ['nullable', 'string', 'max:5'],
            'tin_id_number' => ['nullable', 'string', 'max:255'],
            'philhealth_number' => ['nullable', 'string', 'max:255'],
            'sss_number' => ['nullable', 'string', 'max:255'],
            'hdmf_number' => ['nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:255'],
            'emergency_contact_number' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'formal_picture' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
            'employee_signature' => ['nullable', 'string'],
        ];
    }
}
