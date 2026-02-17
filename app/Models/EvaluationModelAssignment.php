<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationModelAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'job_definition_id',
        'evaluation_model',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the job definition.
     */
    public function jobDefinition(): BelongsTo
    {
        return $this->belongsTo(JobDefinition::class);
    }
}
