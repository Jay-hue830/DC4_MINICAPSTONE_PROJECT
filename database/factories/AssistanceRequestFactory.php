<?php

namespace Database\Factories;

use App\Models\AssistanceRequest;
use App\Models\AssistanceType;
use App\Models\SeniorCitizen;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssistanceRequestFactory extends Factory
{
    protected $model = AssistanceRequest::class;

    public function definition(): array
    {
        return [
            'senior_citizen_id' => SeniorCitizen::factory(),
            'assistance_type_id' => AssistanceType::factory(),
            'title' => fake()->randomElement([
                'Request for monthly maintenance medicine',
                'Need escort to the health center',
                'Request for grocery and food pack',
                'Repair of leaking roof',
            ]),
            'description' => fake()->randomElement([
                'I am unable to buy my maintenance medicine this month because of limited funds.',
                'I need someone to accompany me to my scheduled check-up at the municipal health center.',
                'My household has run out of rice and basic food items until the next pension release.',
                'The roof of my house leaks whenever it rains and I need help with repairs.',
            ]),
            'date_needed' => fake()->dateTimeBetween('+3 days', '+45 days')->format('Y-m-d'),
            'status' => 'pending',
            'reviewed_by' => null,
            'reviewed_at' => null,
            'admin_remarks' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => ['status' => 'approved']);
    }
}