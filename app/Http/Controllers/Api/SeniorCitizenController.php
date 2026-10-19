<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSeniorCitizenRequest;
use App\Http\Requests\UpdateSeniorCitizenRequest;
use App\Http\Resources\SeniorCitizenResource;
use App\Models\SeniorCitizen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class SeniorCitizenController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $sortable = ['last_name', 'first_name', 'birth_date', 'barangay', 'created_at'];
        $requestedSort = $request->query('sort_by');
        $sortBy = in_array($requestedSort, $sortable, true) ? $requestedSort : 'created_at';
        $sortDir = $request->query('sort_dir') === 'asc' ? 'asc' : 'desc';
        $perPage = min(max($request->integer('per_page', 10), 1), 50);

        $seniors = SeniorCitizen::query()
            ->with('user:id,name,email')
            ->withCount('assistanceRequests')
            ->when($request->query('search'), function ($query, $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('barangay', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%");
                });
            })
            ->when($request->query('barangay'), fn ($query, $value) => $query->where('barangay', $value))
            ->when($request->query('sex'), fn ($query, $value) => $query->where('sex', $value))
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage)
            ->withQueryString();

        return SeniorCitizenResource::collection($seniors);
    }

    public function store(StoreSeniorCitizenRequest $request): JsonResponse
    {
        $seniorCitizen = SeniorCitizen::query()->create($request->validated());

        return (new SeniorCitizenResource($seniorCitizen->load('user:id,name,email')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(SeniorCitizen $seniorCitizen): SeniorCitizenResource
    {
        return new SeniorCitizenResource(
            $seniorCitizen->load(['user:id,name,email', 'assistanceRequests.assistanceType'])
        );
    }

    public function update(
        UpdateSeniorCitizenRequest $request,
        SeniorCitizen $seniorCitizen
    ): SeniorCitizenResource {
        $seniorCitizen->update($request->validated());

        return new SeniorCitizenResource($seniorCitizen->load('user:id,name,email'));
    }

    public function destroy(SeniorCitizen $seniorCitizen): Response
    {
        $seniorCitizen->delete();

        return response()->noContent();
    }
}
