<?php

namespace App\Http\Requests\Library;

use Illuminate\Foundation\Http\FormRequest;

class StoreLibraryAttendanceFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', 'exists:library_students,id'],
            'rating' => ['nullable', 'string', 'in:excellent,good,medium,poor,very_bad'],
            'declined' => ['nullable', 'boolean'],
        ];
    }
}
