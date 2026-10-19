<?php

namespace Tests\Feature\Api;

use App\Models\AssistanceRequest;
use App\Models\AssistanceType;
use App\Models\SeniorCitizen;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_returns_request_and_senior_citizen_statistics(): void
    {
        $admin = User::factory()->admin()->create();
        $seniorCitizen = SeniorCitizen::factory()->create();
        $assistanceType = AssistanceType::factory()->create();
        AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->for($assistanceType, 'assistanceType')
            ->create(['status' => 'pending']);
        AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->for($assistanceType, 'assistanceType')
            ->create(['status' => 'approved']);
        AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->for($assistanceType, 'assistanceType')
            ->create(['status' => 'completed']);
        AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->for($assistanceType, 'assistanceType')
            ->create(['status' => 'rejected']);

        $this->actingAs($admin)
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.total_senior_citizens', 1)
            ->assertJsonPath('data.total_requests', 4)
            ->assertJsonPath('data.pending_requests', 1)
            ->assertJsonPath('data.approved_requests', 1)
            ->assertJsonPath('data.completed_requests', 1)
            ->assertJsonPath('data.rejected_requests', 1)
            ->assertJsonPath('data.requests_this_month', 4)
            ->assertJsonPath('data.requests_by_status.pending', 1)
            ->assertJsonPath('data.requests_by_status.approved', 1)
            ->assertJsonPath('data.requests_by_status.completed', 1)
            ->assertJsonPath('data.requests_by_status.rejected', 1)
            ->assertJsonPath('data.requests_by_type.0.id', $assistanceType->id)
            ->assertJsonPath('data.requests_by_type.0.total', 4);
    }

    public function test_senior_dashboard_returns_only_the_users_request_statistics(): void
    {
        $user = User::factory()->senior()->create();
        $seniorCitizen = SeniorCitizen::factory()->for($user)->create();
        $assistanceType = AssistanceType::factory()->create();
        AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->for($assistanceType, 'assistanceType')
            ->create(['status' => 'pending']);
        AssistanceRequest::factory()->create(['status' => 'approved']);

        $this->actingAs($user)
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.total_requests', 1)
            ->assertJsonPath('data.pending_requests', 1)
            ->assertJsonPath('data.requests_by_status.pending', 1)
            ->assertJsonPath('data.requests_by_status.approved', 0)
            ->assertJsonPath('data.requests_by_type.0.total', 1)
            ->assertJsonCount(1, 'data.recent_requests')
            ->assertJsonMissingPath('data.total_senior_citizens');
    }
}
