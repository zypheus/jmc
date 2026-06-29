<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class SendSmsBlastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:2000'],
            'year' => ['nullable', 'string', 'max:50'],
            'course' => ['nullable', 'string', 'max:255'],
        ];
    }
}
