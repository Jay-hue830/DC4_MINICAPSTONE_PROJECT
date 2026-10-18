<?php

namespace Tests\Feature\Api;

use App\Models\AssistanceRequest;
use App\Models\SeniorCitizen;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssistanceRequestControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_senior_citizen_cannot_view_another_users_request(): void
    {
        $user = User::factory()->senior()->create();
        $otherSeniorCitizen = SeniorCitizen::factory()->create();
        $assistanceRequest = AssistanceRequest::factory()
            ->for($otherSeniorCitizen, 'seniorCitizen')
            ->create();

        $this->actingAs($user)
            ->getJson("/api/assistance-requests/{$assistanceRequest->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'You cannot access this request.');
    }

    public function test_admin_can_transition_a_pending_request_and_record_review_details(): void
    {
        $admin = User::factory()->admin()->create();
        $assistanceRequest = AssistanceRequest::factory()->create();

        $this->actingAs($admin)
            ->patchJson("/api/assistance-requests/{$assistanceRequest->id}/status", [
                'status' => 'rejected',
                'admin_remarks' => 'Insufficient documentation.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.admin_remarks', 'Insufficient documentation.');

        $this->assertDatabaseHas('assistance_requests', [
            'id' => $assistanceRequest->id,
            'status' => 'rejected',
            'admin_remarks' => 'Insufficient documentation.',
            'reviewed_by' => $admin->id,
        ]);
    }

    public function test_admin_cannot_transition_a_request_from_a_terminal_status(): void
    {
        $admin = User::factory()->admin()->create();
        $assistanceRequest = AssistanceRequest::factory()->create(['status' => 'completed']);

        $this->actingAs($admin)
            ->patchJson("/api/assistance-requests/{$assistanceRequest->id}/status", [
                'status' => 'pending',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.status.0', 'Allowed next statuses: none');

        $this->assertDatabaseHas('assistance_requests', [
            'id' => $assistanceRequest->id,
            'status' => 'completed',
            'reviewed_by' => null,
        ]);
    }
}
