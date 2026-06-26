<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSectionSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'enabled' => ['required', 'in:0,1'],
            'sections' => ['required', 'array', 'min:1'],
            'sections.*' => ['required', 'string', 'max:120', 'distinct'],
        ];
    }
}
