<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssistanceRequestResource;
use App\Models\AssistanceRequest;
use App\Models\AssistanceType;
use App\Models\SeniorCitizen;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $counts = AssistanceRequest::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $requestsByStatus = collect(AssistanceRequest::STATUSES)
            ->mapWithKeys(fn (string $status): array => [
                $status => (int) ($counts[$status] ?? 0),
            ]);

        $requestsByType = AssistanceType::query()
            ->withCount('assistanceRequests')
            ->get()
            ->map(fn (AssistanceType $assistanceType): array => [
                'id' => $assistanceType->id,
                'name' => $assistanceType->name,
                'total' => $assistanceType->assistance_requests_count,
            ]);

        $recentRequests = AssistanceRequest::query()
            ->with(['seniorCitizen', 'assistanceType'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'data' => [
                'total_senior_citizens' => SeniorCitizen::query()->count(),
                'total_requests' => AssistanceRequest::query()->count(),
                'pending_requests' => $requestsByStatus['pending'],
                'requests_this_month' => AssistanceRequest::query()
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'requests_by_status' => $requestsByStatus,
                'requests_by_type' => $requestsByType,
                'recent_requests' => AssistanceRequestResource::collection($recentRequests),
            ],
        ]);
    }
}
