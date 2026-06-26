<?php

namespace App\Http\Requests\Attendance;

use App\Domain\Attendance\Models\AttendanceEmployee;
use App\Domain\Attendance\Models\AttendanceStudent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'patron_type' => ['required', Rule::in(['student', 'employee'])],
            'patron_id' => ['required', 'integer', 'min:1'],
            'section' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $type = $this->input('patron_type');
            $id = $this->input('patron_id');

            if ($type === 'student') {
                if (! AttendanceStudent::query()->whereKey($id)->exists()) {
                    $validator->errors()->add('patron_id', 'Student not found.');
                }
            }

            if ($type === 'employee') {
                if (! AttendanceEmployee::query()->whereKey($id)->exists()) {
                    $validator->errors()->add('patron_id', 'Employee not found.');
                }
            }
        });
    }
}
