<?php

namespace Tests\Feature\Api;

use App\Models\AssistanceType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssistanceTypeControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_active_assistance_types(): void
    {
        $user = User::factory()->senior()->create();
        $activeType = AssistanceType::factory()->create(['name' => 'Food Assistance']);
        AssistanceType::factory()->create([
            'name' => 'Inactive Assistance',
            'is_active' => false,
        ]);

        $this->actingAs($user)
            ->getJson('/api/assistance-types')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $activeType->id)
            ->assertJsonPath('data.0.name', 'Food Assistance');
    }

    public function test_assistance_type_list_requires_authentication(): void
    {
        $this->getJson('/api/assistance-types')
            ->assertUnauthorized();
    }
}
