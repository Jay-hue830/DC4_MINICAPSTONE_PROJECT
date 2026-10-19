<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AuthRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_senior_user_and_profile_without_accepting_role(): void
    {
        $this->postJson('/api/register', [
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'maria.santos@example.test',
            'password' => 'SecurePass2026',
            'password_confirmation' => 'SecurePass2026',
            'birth_date' => '1950-01-01',
            'sex' => 'female',
            'contact_number' => '09171234567',
            'address' => 'Purok 1, Rizal Street',
            'barangay' => 'San Roque',
            'role' => 'admin',
        ])
            ->assertCreated()
            ->assertJsonPath('data.user.name', 'Maria Santos')
            ->assertJsonPath('data.user.role', User::ROLE_SENIOR_CITIZEN)
            ->assertJsonStructure(['data' => ['user', 'token', 'token_type']]);

        $user = User::query()->where('email', 'maria.santos@example.test')->firstOrFail();

        $this->assertDatabaseHas('senior_citizens', [
            'user_id' => $user->id,
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'sex' => 'female',
            'address' => 'Purok 1, Rizal Street',
        ]);
        $this->assertSame('1950-01-01', $user->seniorCitizen->birth_date->toDateString());
        $this->assertDatabaseMissing('users', [
            'email' => 'maria.santos@example.test',
            'role' => 'admin',
        ]);
        $this->assertSame(
            1,
            DB::table('personal_access_tokens')->where('tokenable_id', $user->id)->count()
        );
    }

    public function test_registration_requires_complete_valid_senior_profile_data(): void
    {
        $this->postJson('/api/register', [
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'maria.santos@example.test',
            'password' => 'SecurePass2026',
            'password_confirmation' => 'SecurePass2026',
            'birth_date' => now()->subYears(59)->toDateString(),
            'sex' => 'female',
            'contact_number' => '123',
            'address' => '',
            'barangay' => '',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'birth_date',
                'contact_number',
                'address',
                'barangay',
            ]);

        $this->assertDatabaseMissing('users', [
            'email' => 'maria.santos@example.test',
        ]);
    }

    public function test_registration_rejects_duplicate_email_addresses(): void
    {
        User::factory()->create(['email' => 'existing@example.test']);

        $this->postJson('/api/register', [
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'existing@example.test',
            'password' => 'SecurePass2026',
            'password_confirmation' => 'SecurePass2026',
            'birth_date' => '1950-01-01',
            'sex' => 'female',
            'contact_number' => '09171234567',
            'address' => 'Purok 1, Rizal Street',
            'barangay' => 'San Roque',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email'])
            ->assertJsonPath('errors.email.0', 'This email address is already registered.');
    }
}
