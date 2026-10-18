<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeniorCitizenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => "{$this->first_name} {$this->last_name}",
            'birth_date' => $this->birth_date?->toDateString(),
            'age' => $this->birth_date?->age,
            'sex' => $this->sex,
            'address' => $this->address,
            'barangay' => $this->barangay,
            'contact_number' => $this->contact_number,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_number' => $this->emergency_contact_number,
            'assistance_requests_count' => $this->whenCounted('assistanceRequests'),
            'user' => $this->whenLoaded('user', fn () => $this->user
                ? [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ]
                : null),
            'assistance_requests' => AssistanceRequestResource::collection(
                $this->whenLoaded('assistanceRequests')
            ),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
