<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function seniorCitizen(): HasOne
    {
        return $this->hasOne(SeniorCitizen::class);
    }

    // Requests this user (as a senior) submitted
    public function assistanceRequests(): HasManyThrough
    {
        return $this->hasManyThrough(
            AssistanceRequest::class,
            SeniorCitizen::class,
            'user_id',
            'senior_citizen_id'
        );
    }

    // Requests this user (as an admin) reviewed
    public function reviewedRequests(): HasMany
    {
        return $this->hasMany(AssistanceRequest::class, 'reviewed_by');
    }
}