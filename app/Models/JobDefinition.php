<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobDefinition extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'job_keyword_id',
        'job_name',
        'grouped_job_keyword_ids',
        'job_description',
        'job_specification',
        'competency_levels',
        'csfs',
        'is_finalized',
    ];

    protected $casts = [
        'grouped_job_keyword_ids' => 'array',
        'job_specification' => 'array',
        'competency_levels' => 'array',
        'csfs' => 'array',
        'is_finalized' => 'boolean',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the job keyword.
     */
    public function jobKeyword(): BelongsTo
    {
        return $this->belongsTo(JobKeyword::class);
    }
}
