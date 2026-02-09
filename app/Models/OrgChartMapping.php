<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrgChartMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'org_unit_name',
        'job_keyword_ids',
        'org_head_name',
        'org_head_rank',
        'org_head_title',
        'org_head_email',
        'job_specialists',
    ];

    protected $casts = [
        'job_keyword_ids' => 'array',
        'job_specialists' => 'array',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
