<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password;

    public function definition(): array
    {
        $first = fake()->randomElement(['Maria', 'Jose', 'Rosario', 'Antonio', 'Lourdes', 'Ramon', 'Teresita', 'Eduardo']);
        $last = fake()->randomElement(['Reyes', 'Santos', 'Garcia', 'Bautista', 'Mendoza', 'Villanueva', 'Aquino', 'Castillo']);

        return [
            'name' => "$first $last",
            'email' => Str::slug("$first.$last", '.').fake()->unique()->numberBetween(10, 9999).'@seniorcare.test',
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('Senior#2026'),
            'role' => User::ROLE_SENIOR_CITIZEN,
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    public function senior(): static
    {
        return $this->state(fn () => ['role' => User::ROLE_SENIOR_CITIZEN]);
    }
}
