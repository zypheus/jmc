<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', 'exists:attendance_students,id'],
            'rating' => ['nullable', 'string', 'in:excellent,good,medium,poor,very_bad'],
            'declined' => ['nullable', 'boolean'],
        ];
    }
}
