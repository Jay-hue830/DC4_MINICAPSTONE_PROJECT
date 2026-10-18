<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssistanceRequest extends Model
{
    use HasFactory;

    public const STATUSES = ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'];

public const TRANSITIONS = [
    'pending'     => ['approved', 'rejected', 'cancelled'],
    'approved'    => ['in_progress', 'completed', 'cancelled'],
    'in_progress' => ['completed', 'cancelled'],
    'rejected'    => [],
    'completed'   => [],
    'cancelled'   => [],
];

    protected function casts(): array
    {
        return [
            'date_needed' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    public function seniorCitizen(): BelongsTo
    {
        return $this->belongsTo(SeniorCitizen::class);
    }

    public function assistanceType(): BelongsTo
    {
        return $this->belongsTo(AssistanceType::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}