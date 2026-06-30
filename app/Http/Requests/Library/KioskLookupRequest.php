<?php

namespace App\Http\Requests\Library;

use Illuminate\Foundation\Http\FormRequest;

class KioskLookupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:255'],
        ];
    }
}
