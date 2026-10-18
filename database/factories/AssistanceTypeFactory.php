<?php

namespace Database\Factories;

use App\Models\AssistanceType;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssistanceTypeFactory extends Factory
{
    protected $model = AssistanceType::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement([
                'Medical Check-up Assistance',
                'Medicine Purchase Assistance',
                'Food Pack Assistance',
                'Transportation Assistance',
                'Home Repair Assistance',
                'Eyeglasses Assistance',
            ]) . ' ' . fake()->unique()->numerify('Batch ####'),
            'description' => fake()->sentence(10),
            'is_active' => true,
        ];
    }
}