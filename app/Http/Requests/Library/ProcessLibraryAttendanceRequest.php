<?php

namespace App\Http\Requests\Library;

use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryStudent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessLibraryAttendanceRequest extends FormRequest
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

            if ($type === 'student' && ! LibraryStudent::query()->whereKey($id)->exists()) {
                $validator->errors()->add('patron_id', 'Library student not found.');
            }

            if ($type === 'employee' && ! LibraryEmployee::query()->whereKey($id)->exists()) {
                $validator->errors()->add('patron_id', 'Library employee not found.');
            }
        });
    }
}
