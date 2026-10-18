<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssistanceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'senior_citizen_id' => [
                Rule::requiredIf(fn (): bool => $this->user()->isAdmin()),
                'exists:senior_citizens,id',
            ],
            'assistance_type_id' => ['required', 'exists:assistance_types,id'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:2000'],
            'date_needed' => ['required', 'date', 'after_or_equal:today'],
        ];
    }
}
