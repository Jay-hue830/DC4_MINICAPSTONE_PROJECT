<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email')) {
            $this->merge(['email' => strtolower(trim((string) $this->input('email')))]);
        }
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->letters()->numbers()],
            'birth_date' => ['required', 'date', 'before_or_equal:-60 years'],
            'sex' => ['required', Rule::in(['male', 'female'])],
            'contact_number' => ['required', 'regex:/^(09|\+639)\d{9}$/'],
            'address' => ['required', 'string', 'max:255'],
            'barangay' => ['required', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email address is already registered.',
            'birth_date.before_or_equal' => 'A senior citizen must be at least 60 years old.',
            'contact_number.regex' => 'Use a PH mobile number like 09171234567.',
        ];
    }
}
