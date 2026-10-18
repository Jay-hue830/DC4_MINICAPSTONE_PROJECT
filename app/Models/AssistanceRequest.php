<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssistanceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'senior_citizen_id', 'assistance_type_id', 'title', 'description',
        'date_needed', 'status', 'reviewed_by', 'reviewed_at', 'admin_remarks',
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