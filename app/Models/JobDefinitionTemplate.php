<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobDefinitionTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_keyword_id',
        'industry_category',
        'company_size_range',
        'job_description',
        'job_specification',
        'competency_levels',
        'csfs',
        'is_active',
    ];

    protected $casts = [
        'job_specification' => 'array',
        'competency_levels' => 'array',
        'csfs' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the job keyword.
     */
    public function jobKeyword(): BelongsTo
    {
        return $this->belongsTo(JobKeyword::class);
    }
}
