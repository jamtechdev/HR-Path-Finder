<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobEvaluationModelRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_keyword_id',
        'recommended_model',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the job keyword.
     */
    public function jobKeyword(): BelongsTo
    {
        return $this->belongsTo(JobKeyword::class);
    }

    /**
     * Get recommended model for a job keyword.
     */
    public static function getRecommendationForJob(int $jobKeywordId): ?string
    {
        $recommendation = self::where('job_keyword_id', $jobKeywordId)
            ->where('is_active', true)
            ->first();
        
        return $recommendation ? $recommendation->recommended_model : null;
    }
}
