<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssistanceRequestResource;
use App\Models\AssistanceRequest;
use App\Models\AssistanceType;
use App\Models\SeniorCitizen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $requests = AssistanceRequest::query();

        if (! $user->isAdmin()) {
            $requests->whereHas(
                'seniorCitizen',
                fn ($query) => $query->where('user_id', $user->id)
            );
        }

        $counts = (clone $requests)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $requestsByStatus = collect(AssistanceRequest::STATUSES)
            ->mapWithKeys(fn (string $status): array => [
                $status => (int) ($counts[$status] ?? 0),
            ]);

        $requestsByType = AssistanceType::query()
            ->withCount([
                'assistanceRequests' => fn ($query) => $query
                    ->when(! $user->isAdmin(), fn ($query) => $query->whereHas(
                        'seniorCitizen',
                        fn ($seniorCitizenQuery) => $seniorCitizenQuery->where('user_id', $user->id)
                    )),
            ])
            ->get()
            ->map(fn (AssistanceType $assistanceType): array => [
                'id' => $assistanceType->id,
                'name' => $assistanceType->name,
                'total' => $assistanceType->assistance_requests_count,
            ]);

        $recentRequests = (clone $requests)
            ->with(['seniorCitizen', 'assistanceType'])
            ->latest()
            ->take(5)
            ->get();

        $data = [
            'total_requests' => (clone $requests)->count(),
            'pending_requests' => $requestsByStatus['pending'],
            'approved_requests' => $requestsByStatus['approved'],
            'completed_requests' => $requestsByStatus['completed'],
            'rejected_requests' => $requestsByStatus['rejected'],
            'requests_this_month' => (clone $requests)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'requests_by_status' => $requestsByStatus,
            'requests_by_type' => $requestsByType,
            'recent_requests' => AssistanceRequestResource::collection($recentRequests),
        ];

        if ($user->isAdmin()) {
            $data['total_senior_citizens'] = SeniorCitizen::query()->count();
        }

        return response()->json(['data' => $data]);
    }
}
