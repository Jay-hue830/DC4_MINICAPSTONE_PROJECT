<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_route_returns_application_status(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->getJson('/api/health')
            ->assertOk()
            ->assertJsonStructure([
                'status',
                'app',
                'time',
            ])
            ->assertJson([
                'status' => 'ok',
                'app' => config('app.name'),
            ]);
    }

    public function test_health_route_requires_authentication(): void
    {
        $this->getJson('/api/health')
            ->assertUnauthorized();
    }
}
