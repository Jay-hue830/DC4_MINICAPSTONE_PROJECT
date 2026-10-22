<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssistanceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assistance_type_id' => ['sometimes', 'required', 'exists:assistance_types,id'],
            'title' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['sometimes', 'required', 'string', 'max:2000'],
            'date_needed' => ['sometimes', 'required', 'date', 'after_or_equal:today'],
        ];
    }
}
