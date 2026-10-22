<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSeniorCitizenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id', 'unique:senior_citizens,user_id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'birth_date' => ['required', 'date', 'before_or_equal:-60 years'],
            'sex' => ['required', Rule::in(['male', 'female'])],
            'address' => ['required', 'string', 'max:255'],
            'barangay' => ['required', 'string', 'max:100'],
            'contact_number' => ['required', 'regex:/^(09|\+639)\d{9}$/'],
            'emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'emergency_contact_number' => ['nullable', 'regex:/^(09|\+639)\d{9}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'birth_date.before_or_equal' => 'A senior citizen must be at least 60 years old.',
            'contact_number.regex' => 'Use a PH mobile number like 09171234567.',
        ];
    }
}
