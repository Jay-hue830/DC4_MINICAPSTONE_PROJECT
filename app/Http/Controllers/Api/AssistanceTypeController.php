<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssistanceTypeResource;
use App\Models\AssistanceType;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AssistanceTypeController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        return AssistanceTypeResource::collection(
            AssistanceType::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
        );
    }
}
