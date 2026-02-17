<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;

class KpiReviewToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'organization_name',
        'token',
        'email',
        'name',
        'expires_at',
        'max_uses',
        'uses_count',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'max_uses' => 'integer',
        'uses_count' => 'integer',
        'is_used' => 'boolean',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Generate a unique token.
     */
    public static function generateToken(): string
    {
        return Str::random(64);
    }

    /**
     * Check if token is valid.
     */
    public function isValid(): bool
    {
        if ($this->is_used) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->uses_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    /**
     * Increment use count.
     */
    public function incrementUse(): void
    {
        $this->increment('uses_count');
        
        if ($this->uses_count >= $this->max_uses) {
            $this->update(['is_used' => true]);
        }
    }
}
