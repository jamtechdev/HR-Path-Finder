<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        // Organizational Evaluation
        'org_evaluation_cycle',
        'org_evaluation_timing',
        'org_evaluator_type',
        'org_evaluation_method',
        'org_rating_scale',
        'org_rating_distribution',
        'org_evaluation_group',
        'org_use_of_results',
        // Individual Evaluation
        'individual_evaluation_cycle',
        'individual_evaluation_timing',
        'individual_evaluator_types',
        'individual_evaluators',
        'individual_evaluation_method',
        'individual_rating_scale',
        'individual_rating_distribution',
        'individual_evaluation_groups',
        'individual_use_of_results',
        'organization_leader_evaluation',
    ];

    protected $casts = [
        'org_rating_distribution' => 'array',
        'org_use_of_results' => 'array',
        'individual_evaluator_types' => 'array',
        'individual_evaluators' => 'array',
        'individual_rating_distribution' => 'array',
        'individual_evaluation_groups' => 'array',
        'individual_use_of_results' => 'array',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
