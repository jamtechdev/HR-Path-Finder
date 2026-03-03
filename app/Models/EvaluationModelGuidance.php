<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationModelGuidance extends Model
{
    use HasFactory;

    protected $table = 'evaluation_model_guidance';

    protected $fillable = [
        'model_type',
        'concept',
        'key_characteristics',
        'example',
        'pros',
        'cons',
        'best_fit_organizations',
        'recommended_job_keyword_ids',
        'version',
        'is_active',
    ];

    protected $casts = [
        'recommended_job_keyword_ids' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get active guidance by model type.
     */
    public static function getActiveByModelType(string $modelType): ?self
    {
        return self::where('model_type', $modelType)
            ->where('is_active', true)
            ->orderBy('version', 'desc')
            ->first();
    }
}
