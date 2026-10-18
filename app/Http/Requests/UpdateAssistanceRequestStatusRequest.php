<?php

namespace App\Http\Requests;

use App\Models\AssistanceRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssistanceRequestStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(AssistanceRequest::STATUSES)],
            'admin_remarks' => ['required_if:status,rejected', 'nullable', 'string', 'max:1000'],
        ];
    }
}
