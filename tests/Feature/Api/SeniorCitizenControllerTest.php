<?php

namespace Tests\Feature\Api;

use App\Models\SeniorCitizen;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeniorCitizenControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_senior_citizen_profile_for_an_existing_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->senior()->create();

        $this->actingAs($admin)
            ->postJson('/api/senior-citizens', [
                'user_id' => $user->id,
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'birth_date' => '1950-01-01',
                'sex' => 'female',
                'address' => 'Purok 1',
                'barangay' => 'San Roque',
                'contact_number' => '09171234567',
            ])
            ->assertCreated()
            ->assertJsonPath('data.sex', 'female');

        $this->assertDatabaseHas('senior_citizens', [
            'user_id' => $user->id,
            'first_name' => 'Maria',
            'sex' => 'female',
        ]);
    }

    public function test_admin_can_filter_senior_citizens_by_sex(): void
    {
        $admin = User::factory()->admin()->create();
        SeniorCitizen::factory()->create(['sex' => 'female']);
        SeniorCitizen::factory()->create(['sex' => 'male']);

        $this->actingAs($admin)
            ->getJson('/api/senior-citizens?sex=female')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.sex', 'female');
    }

    public function test_admin_can_paginate_and_search_senior_citizens(): void
    {
        $admin = User::factory()->admin()->create();
        SeniorCitizen::factory()->count(3)->create([
            'first_name' => 'Maria',
            'sex' => 'female',
        ]);
        SeniorCitizen::factory()->create([
            'first_name' => 'Juan',
            'sex' => 'male',
        ]);

        $firstPage = $this->actingAs($admin)
            ->getJson('/api/senior-citizens?search=Maria&per_page=2&page=1')
            ->assertOk()
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('data.0.first_name', 'Maria')
            ->assertJsonPath('data.1.first_name', 'Maria')
            ->assertJsonPath('links.next', fn ($url) => str_contains($url, 'search=Maria')
                && str_contains($url, 'per_page=2'));

        $secondPage = $this->getJson('/api/senior-citizens?search=Maria&per_page=2&page=2')
            ->assertOk()
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.total', 3)
            ->assertJsonCount(1, 'data');

        $this->assertNotSame(
            $firstPage->json('data.0.id'),
            $secondPage->json('data.0.id')
        );
    }

    public function test_senior_citizen_page_size_is_limited_to_fifty(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->getJson('/api/senior-citizens?per_page=500')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 50);

        $this->getJson('/api/senior-citizens?per_page=0')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1);
    }
}
