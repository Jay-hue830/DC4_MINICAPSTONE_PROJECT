<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSeniorCitizenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $seniorCitizen = $this->route('senior_citizen');
        $id = is_object($seniorCitizen) ? $seniorCitizen->id : $seniorCitizen;

        return [
            'user_id' => [
                'sometimes',
                'required',
                'exists:users,id',
                Rule::unique('senior_citizens', 'user_id')->ignore($id),
            ],
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'birth_date' => ['sometimes', 'required', 'date', 'before_or_equal:-60 years'],
            'sex' => ['sometimes', 'required', Rule::in(['male', 'female'])],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
            'barangay' => ['sometimes', 'required', 'string', 'max:100'],
            'contact_number' => ['sometimes', 'required', 'regex:/^(09|\+639)\d{9}$/'],
            'emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'emergency_contact_number' => ['nullable', 'regex:/^(09|\+639)\d{9}$/'],
        ];
    }
}
