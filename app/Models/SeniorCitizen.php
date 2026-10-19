<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SeniorCitizen extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'first_name', 'middle_name', 'last_name', 'birth_date', 'sex',
        'contact_number', 'address', 'barangay',
        'emergency_contact_name', 'emergency_contact_number', 'health_notes',
    ];

    protected function casts(): array
    {
        return ['birth_date' => 'date'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assistanceRequests(): HasMany
    {
        return $this->hasMany(AssistanceRequest::class);
    }

    public function scopeSearchByName(Builder $query, string $search): void
    {
        $terms = preg_split('/\s+/', trim($search), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        foreach ($terms as $term) {
            $query->where(function (Builder $query) use ($term): void {
                $query->where('first_name', 'like', "%{$term}%")
                    ->orWhere('middle_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%");
            });
        }
    }
}
