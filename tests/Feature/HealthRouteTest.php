<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthRouteTest extends TestCase
{
    public function test_health_route_returns_application_status(): void
    {
        $this->getJson('/api/health')
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
}
