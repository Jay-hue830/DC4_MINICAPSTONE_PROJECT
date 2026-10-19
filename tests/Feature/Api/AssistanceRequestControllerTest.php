<?php

namespace Tests\Feature\Api;

use App\Models\AssistanceRequest;
use App\Models\AssistanceType;
use App\Models\SeniorCitizen;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssistanceRequestControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_paginate_and_filter_assistance_requests(): void
    {
        $admin = User::factory()->admin()->create();
        AssistanceRequest::factory()->count(3)->create(['status' => 'pending']);
        AssistanceRequest::factory()->create(['status' => 'approved']);

        $firstPage = $this->actingAs($admin)
            ->getJson('/api/assistance-requests?status=pending&per_page=2&page=1')
            ->assertOk()
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('data.0.status', 'pending')
            ->assertJsonPath('data.1.status', 'pending')
            ->assertJsonPath('links.next', fn ($url) => str_contains($url, 'status=pending')
                && str_contains($url, 'per_page=2'));

        $secondPage = $this->getJson('/api/assistance-requests?status=pending&per_page=2&page=2')
            ->assertOk()
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.total', 3)
            ->assertJsonCount(1, 'data');

        $this->assertNotSame(
            $firstPage->json('data.0.id'),
            $secondPage->json('data.0.id')
        );
    }

    public function test_assistance_request_page_size_is_limited_to_fifty(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->getJson('/api/assistance-requests?per_page=500')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 50);

        $this->getJson('/api/assistance-requests?per_page=0')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1);
    }

    public function test_admin_can_search_and_filter_assistance_requests(): void
    {
        $admin = User::factory()->admin()->create();
        $seniorCitizen = SeniorCitizen::factory()->create([
            'first_name' => 'Maria',
            'last_name' => 'Santos',
        ]);
        $assistanceType = AssistanceType::factory()->create();
        $otherAssistanceType = AssistanceType::factory()->create();

        AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->for($assistanceType, 'assistanceType')
            ->create([
                'title' => 'Medical transportation',
                'description' => 'A ride to the clinic',
                'date_needed' => '2026-10-20',
                'status' => 'pending',
            ]);

        AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->for($otherAssistanceType, 'assistanceType')
            ->create([
                'title' => 'Food support',
                'description' => 'Grocery assistance',
                'date_needed' => '2026-10-20',
                'status' => 'pending',
            ]);

        AssistanceRequest::factory()->create([
            'title' => 'Roof repair',
            'description' => 'Help repairing a roof',
            'date_needed' => '2026-10-21',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/assistance-requests?search=Maria%20Santos&assistance_type_id='.$assistanceType->id.'&status=pending&date_from=2026-10-20&date_to=2026-10-20')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.title', 'Medical transportation')
            ->assertJsonPath('data.0.senior_citizen.first_name', 'Maria')
            ->assertJsonPath('data.0.assistance_type.id', $assistanceType->id);

        $this->getJson('/api/assistance-requests?search=transportation')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.title', 'Medical transportation');

        $this->getJson('/api/assistance-requests?search=clinic')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.description', 'A ride to the clinic');
    }

    public function test_invalid_request_fields_return_validation_errors(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/assistance-requests', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'senior_citizen_id',
                'assistance_type_id',
                'title',
                'description',
                'date_needed',
            ]);
    }

    public function test_unknown_request_ids_return_not_found(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->getJson('/api/assistance-requests/999999')
            ->assertNotFound();
    }

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

    public function test_senior_citizen_request_creation_uses_its_own_profile_and_pending_status(): void
    {
        $user = User::factory()->senior()->create();
        $seniorCitizen = SeniorCitizen::factory()->for($user)->create();
        $otherSeniorCitizen = SeniorCitizen::factory()->create();
        $assistanceType = AssistanceType::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/assistance-requests', [
                'senior_citizen_id' => $otherSeniorCitizen->id,
                'assistance_type_id' => $assistanceType->id,
                'title' => 'Request for transportation',
                'description' => 'I need transportation to my medical appointment.',
                'date_needed' => now()->addDays(3)->toDateString(),
                'status' => 'completed',
            ])
            ->assertCreated()
            ->assertJsonPath('data.senior_citizen.id', $seniorCitizen->id)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('assistance_requests', [
            'senior_citizen_id' => $seniorCitizen->id,
            'status' => 'pending',
            'title' => 'Request for transportation',
        ]);
    }

    public function test_senior_citizen_can_update_only_its_own_pending_request(): void
    {
        $user = User::factory()->senior()->create();
        $seniorCitizen = SeniorCitizen::factory()->for($user)->create();
        $pendingRequest = AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->create();
        $approvedRequest = AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->approved()
            ->create();
        $otherSeniorRequest = AssistanceRequest::factory()->create();

        $this->actingAs($user)
            ->putJson("/api/assistance-requests/{$pendingRequest->id}", [
                'title' => 'Updated request title',
            ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated request title');

        $this->putJson("/api/assistance-requests/{$approvedRequest->id}", [
            'title' => 'Should be forbidden',
        ])->assertForbidden();

        $this->putJson("/api/assistance-requests/{$otherSeniorRequest->id}", [
            'title' => 'Should be forbidden',
        ])->assertForbidden();
    }

    public function test_admin_can_update_pending_and_approved_requests_only(): void
    {
        $admin = User::factory()->admin()->create();
        $pendingRequest = AssistanceRequest::factory()->create();
        $approvedRequest = AssistanceRequest::factory()->approved()->create();
        $completedRequest = AssistanceRequest::factory()->create(['status' => 'completed']);

        $this->actingAs($admin)
            ->putJson("/api/assistance-requests/{$pendingRequest->id}", [
                'title' => 'Pending request updated',
            ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Pending request updated');

        $this->putJson("/api/assistance-requests/{$approvedRequest->id}", [
            'title' => 'Approved request updated',
        ])->assertOk()
            ->assertJsonPath('data.title', 'Approved request updated');

        $this->putJson("/api/assistance-requests/{$completedRequest->id}", [
            'title' => 'Should be forbidden',
        ])->assertForbidden();
    }

    public function test_seniors_can_delete_only_their_own_pending_requests(): void
    {
        $senior = User::factory()->senior()->create();
        $seniorCitizen = SeniorCitizen::factory()->for($senior)->create();
        $pendingRequest = AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->create();
        $approvedRequest = AssistanceRequest::factory()
            ->for($seniorCitizen, 'seniorCitizen')
            ->approved()
            ->create();
        $otherSeniorRequest = AssistanceRequest::factory()->create();

        $this->actingAs($senior)
            ->deleteJson("/api/assistance-requests/{$pendingRequest->id}")
            ->assertNoContent();

        $this->deleteJson("/api/assistance-requests/{$approvedRequest->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'Only pending requests can be deleted.');

        $this->deleteJson("/api/assistance-requests/{$otherSeniorRequest->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'You cannot delete this request.');

        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)
            ->deleteJson("/api/assistance-requests/{$otherSeniorRequest->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('assistance_requests', [
            'id' => $pendingRequest->id,
        ]);
        $this->assertDatabaseHas('assistance_requests', ['id' => $approvedRequest->id]);
        $this->assertDatabaseMissing('assistance_requests', ['id' => $otherSeniorRequest->id]);
    }

    public function test_only_admin_can_update_request_status(): void
    {
        $senior = User::factory()->senior()->create();
        $assistanceRequest = AssistanceRequest::factory()->create();

        $this->actingAs($senior)
            ->patchJson("/api/assistance-requests/{$assistanceRequest->id}/status", [
                'status' => 'approved',
            ])
            ->assertForbidden();
    }

    public function test_status_endpoint_rejects_invalid_status_values(): void
    {
        $admin = User::factory()->admin()->create();
        $assistanceRequest = AssistanceRequest::factory()->create();

        $this->actingAs($admin)
            ->patchJson("/api/assistance-requests/{$assistanceRequest->id}/status", [
                'status' => 'unknown',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
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

    public function test_admin_cannot_complete_a_pending_request_without_approval(): void
    {
        $admin = User::factory()->admin()->create();
        $assistanceRequest = AssistanceRequest::factory()->create(['status' => 'pending']);

        $this->actingAs($admin)
            ->patchJson("/api/assistance-requests/{$assistanceRequest->id}/status", [
                'status' => 'completed',
            ])
            ->assertUnprocessable()
            ->assertJsonPath(
                'errors.status.0',
                'Allowed next statuses: approved, rejected, cancelled'
            );

        $this->assertDatabaseHas('assistance_requests', [
            'id' => $assistanceRequest->id,
            'status' => 'pending',
        ]);
    }
}
