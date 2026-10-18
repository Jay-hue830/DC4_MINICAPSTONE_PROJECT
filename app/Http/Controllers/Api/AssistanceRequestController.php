<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssistanceRequestRequest;
use App\Http\Requests\UpdateAssistanceRequestRequest;
use App\Http\Requests\UpdateAssistanceRequestStatusRequest;
use App\Http\Resources\AssistanceRequestResource;
use App\Models\AssistanceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class AssistanceRequestController extends Controller
{
    private const WITH = ['seniorCitizen', 'assistanceType', 'reviewer:id,name'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $sortable = ['date_needed', 'status', 'created_at'];
        $requestedSort = $request->query('sort_by');
        $sortBy = in_array($requestedSort, $sortable, true) ? $requestedSort : 'created_at';
        $sortDir = $request->query('sort_dir') === 'asc' ? 'asc' : 'desc';
        $perPage = min(max($request->integer('per_page', 10), 1), 100);

        $requests = AssistanceRequest::query()
            ->with(self::WITH)
            ->when(! $user->isAdmin(), fn ($query) => $query->whereHas(
                'seniorCitizen',
                fn ($seniorCitizenQuery) => $seniorCitizenQuery->where('user_id', $user->id)
            ))
            ->when($request->query('status'), fn ($query, $value) => $query->where('status', $value))
            ->when(
                $request->query('assistance_type_id'),
                fn ($query, $value) => $query->where('assistance_type_id', $value)
            )
            ->when(
                $user->isAdmin() && $request->query('senior_citizen_id'),
                fn ($query) => $query->where('senior_citizen_id', $request->query('senior_citizen_id'))
            )
            ->when($request->query('date_from'), fn ($query, $value) => $query->whereDate('date_needed', '>=', $value))
            ->when($request->query('date_to'), fn ($query, $value) => $query->whereDate('date_needed', '<=', $value))
            ->when($request->query('search'), function ($query, $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('seniorCitizen', fn ($seniorCitizenQuery) => $seniorCitizenQuery
                            ->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%"));
                });
            })
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage)
            ->withQueryString();

        return AssistanceRequestResource::collection($requests);
    }

    public function store(StoreAssistanceRequestRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (! $user->isAdmin()) {
            $profile = $user->seniorCitizen;
            abort_if(! $profile, Response::HTTP_FORBIDDEN, 'No senior citizen profile is linked to this account.');
            $data['senior_citizen_id'] = $profile->id;
        }

        $assistanceRequest = AssistanceRequest::query()->create($data + ['status' => 'pending']);

        return (new AssistanceRequestResource($assistanceRequest->load(self::WITH)))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, AssistanceRequest $assistanceRequest): AssistanceRequestResource
    {
        $this->authorizeAccess($request, $assistanceRequest);

        return new AssistanceRequestResource($assistanceRequest->load(self::WITH));
    }

    public function update(
        UpdateAssistanceRequestRequest $request,
        AssistanceRequest $assistanceRequest
    ): AssistanceRequestResource {
        $this->authorizeAccess($request, $assistanceRequest, write: true);
        $assistanceRequest->update($request->validated());

        return new AssistanceRequestResource($assistanceRequest->load(self::WITH));
    }

    public function destroy(Request $request, AssistanceRequest $assistanceRequest): Response
    {
        $this->authorizeAccess($request, $assistanceRequest, write: true);
        $assistanceRequest->delete();

        return response()->noContent();
    }

    public function updateStatus(
        UpdateAssistanceRequestStatusRequest $request,
        AssistanceRequest $assistanceRequest
    ): JsonResponse|AssistanceRequestResource {
        $newStatus = $request->validated('status');
        $allowedTransitions = AssistanceRequest::TRANSITIONS[$assistanceRequest->status] ?? [];

        if (! in_array($newStatus, $allowedTransitions, true)) {
            return response()->json([
                'message' => "Cannot change status from {$assistanceRequest->status} to {$newStatus}.",
                'errors' => [
                    'status' => [
                        'Allowed next statuses: '.(implode(', ', $allowedTransitions) ?: 'none'),
                    ],
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $assistanceRequest->forceFill([
            'status' => $newStatus,
            'admin_remarks' => $request->validated('admin_remarks') ?? $assistanceRequest->admin_remarks,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ])->save();

        return new AssistanceRequestResource($assistanceRequest->load(self::WITH));
    }

    private function authorizeAccess(
        Request $request,
        AssistanceRequest $assistanceRequest,
        bool $write = false
    ): void {
        $user = $request->user();

        if ($user->isAdmin()) {
            return;
        }

        abort_unless(
            $assistanceRequest->seniorCitizen?->user_id === $user->id,
            Response::HTTP_FORBIDDEN,
            'You cannot access this request.'
        );

        abort_if(
            $write && $assistanceRequest->status !== 'pending',
            Response::HTTP_FORBIDDEN,
            'Only pending requests can be changed.'
        );
    }
}
