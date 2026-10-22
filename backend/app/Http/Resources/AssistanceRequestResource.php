<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssistanceRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'date_needed' => $this->date_needed?->toDateString(),
            'status' => $this->status,
            'admin_remarks' => $this->admin_remarks,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'senior_citizen' => new SeniorCitizenResource($this->whenLoaded('seniorCitizen')),
            'assistance_type' => new AssistanceTypeResource($this->whenLoaded('assistanceType')),
            'reviewer' => $this->whenLoaded('reviewer', fn () => $this->reviewer
                ? [
                    'id' => $this->reviewer->id,
                    'name' => $this->reviewer->name,
                ]
                : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
