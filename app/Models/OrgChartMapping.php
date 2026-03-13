<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrgChartMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'parent_id',
        'sort_order',
        'org_unit_name',
        'job_keyword_ids',
        'org_head_name',
        'org_head_rank',
        'org_head_title',
        'org_head_email',
        'is_kpi_reviewer',
        'job_specialists',
    ];

    protected $casts = [
        'job_keyword_ids' => 'array',
        'job_specialists' => 'array',
        'is_kpi_reviewer' => 'boolean',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the parent org unit (for hierarchy).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(OrgChartMapping::class, 'parent_id');
    }

    /**
     * Get child org units.
     */
    public function children(): HasMany
    {
        return $this->hasMany(OrgChartMapping::class, 'parent_id')->orderBy('sort_order');
    }
}
