<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminComment extends Model
{
    use HasFactory;

    protected $table = 'admin_comments';

    protected $fillable = [
        'hr_project_id',
        'user_id',
        'step',
        'comment',
        'recommendation_type',
        'recommended_option',
        'rationale',
        'is_recommendation',
    ];

    protected $casts = [
        'is_recommendation' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the admin user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include recommendations.
     */
    public function scopeRecommendations($query)
    {
        return $query->where('is_recommendation', true);
    }

    /**
     * Scope a query to filter by step.
     */
    public function scopeForStep($query, string $step)
    {
        return $query->where('step', $step);
    }

    /**
     * Scope a query to only include performance recommendations.
     */
    public function scopePerformanceRecommendations($query)
    {
        return $query->where('is_recommendation', true)
            ->where('recommendation_type', 'performance');
    }

    /**
     * Scope a query to only include compensation recommendations.
     */
    public function scopeCompensationRecommendations($query)
    {
        return $query->where('is_recommendation', true)
            ->where('recommendation_type', 'compensation');
    }
}
