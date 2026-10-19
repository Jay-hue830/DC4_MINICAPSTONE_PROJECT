<?php

namespace Tests\Feature\Api;

use App\Models\AssistanceType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AuthSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_read_their_profile_and_logout(): void
    {
        $user = User::factory()->admin()->create([
            'email' => 'admin@example.test',
            'password' => 'SecurePass2026',
        ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@example.test',
            'password' => 'SecurePass2026',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.user.role', User::ROLE_ADMIN)
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonMissingPath('data.user.password');

        $token = $loginResponse->json('data.token');
        $authorization = ['Authorization' => "Bearer {$token}"];

        $this->withHeaders($authorization)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.role', User::ROLE_ADMIN)
            ->assertJsonMissingPath('data.password');

        $this->withHeaders($authorization)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
        Auth::forgetGuards();

        $this->withHeaders($authorization)
            ->getJson('/api/user')
            ->assertUnauthorized();
    }

    public function test_login_rejects_a_wrong_password_with_a_clear_message(): void
    {
        User::factory()->create([
            'email' => 'senior@example.test',
            'password' => 'SecurePass2026',
        ]);

        $this->postJson('/api/login', [
            'email' => 'senior@example.test',
            'password' => 'incorrect-password',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Invalid email or password.');
    }

    public function test_protected_routes_require_a_bearer_token(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
        $this->getJson('/api/assistance-requests')->assertUnauthorized();
    }

    public function test_admin_approval_is_visible_to_the_requesting_senior(): void
    {
        $senior = User::factory()->senior()->create();
        $seniorCitizen = $senior->seniorCitizen()->create([
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'birth_date' => '1950-01-01',
            'sex' => 'female',
            'contact_number' => '09171234567',
            'address' => 'Purok 1',
            'barangay' => 'San Roque',
        ]);
        $assistanceRequest = $seniorCitizen->assistanceRequests()->create([
            'assistance_type_id' => AssistanceType::factory()->create()->id,
            'title' => 'Medical appointment transport',
            'description' => 'Transport to the clinic.',
            'date_needed' => now()->addDays(3)->toDateString(),
            'status' => 'pending',
        ]);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patchJson("/api/assistance-requests/{$assistanceRequest->id}/status", [
                'status' => 'approved',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->actingAs($senior)
            ->getJson("/api/assistance-requests/{$assistanceRequest->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }
}
