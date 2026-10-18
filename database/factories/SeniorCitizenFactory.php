<?php

namespace Database\Factories;

use App\Models\SeniorCitizen;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SeniorCitizenFactory extends Factory
{
    protected $model = SeniorCitizen::class;

    public function definition(): array
    {
        $sex = fake()->randomElement(['male', 'female']);

        $firstNames = $sex === 'male'
            ? ['Rodolfo', 'Ernesto', 'Fernando', 'Domingo', 'Alfredo', 'Romeo']
            : ['Lolita', 'Remedios', 'Corazon', 'Felicidad', 'Natividad', 'Consolacion'];

        return [
            'user_id' => User::factory()->senior(),
            'first_name' => fake()->randomElement($firstNames),
            'middle_name' => fake()->optional(0.7)->randomElement(['Dela Cruz', 'Ramos', 'Flores', 'Pascual', 'Navarro']),
            'last_name' => fake()->randomElement(['Santos', 'Reyes', 'Cruz', 'Ramos', 'Torres', 'Domingo']),
            'birth_date' => fake()->dateTimeBetween('-88 years', '-60 years')->format('Y-m-d'),
            'sex' => $sex,
            'contact_number' => '09' . fake()->numerify('#########'),
            'address' => fake()->randomElement(['Purok 3', 'Purok 5', 'Zone 2', 'Sitio Mabini']) . ', ' . fake()->randomElement(['Rizal St.', 'Mabini St.', 'Bonifacio St.', 'Luna St.']),
            'barangay' => fake()->randomElement(['San Roque', 'Poblacion', 'Santa Cruz', 'San Isidro', 'Bagong Silang']),
            'emergency_contact_name' => fake()->randomElement(['Maricel', 'Jonathan', 'Cherry Ann', 'Mark Anthony']) . ' ' . fake()->randomElement(['Santos', 'Reyes', 'Cruz']),
            'emergency_contact_number' => '09' . fake()->numerify('#########'),
            'health_notes' => fake()->optional(0.6)->randomElement([
                'Maintenance medication for hypertension',
                'Diabetic, needs regular check-ups',
                'Uses a cane when walking',
                'Poor eyesight, wears reading glasses',
            ]),
        ];
    }
}