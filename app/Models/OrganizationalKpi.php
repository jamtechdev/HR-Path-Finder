<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationalKpi extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'organization_name',
        'kpi_name',
        'purpose',
        'category',
        'linked_job_id',
        'linked_csf',
        'formula',
        'measurement_method',
        'weight',
        'is_active',
        'status',
        'proposed_by_manager_id',
        'proposed_at',
        'ceo_approval_status',
        'ceo_revision_comment',
        'revision_comment',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the linked job definition.
     */
    public function linkedJob(): BelongsTo
    {
        return $this->belongsTo(JobDefinition::class, 'linked_job_id');
    }

    /**
     * Get edit history for this KPI.
     */
    public function editHistory(): HasMany
    {
        return $this->hasMany(KpiEditHistory::class, 'organizational_kpi_id');
    }
}
