<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HrProjectCurrentHrStatus extends Model
{
    use HasFactory;

    protected $table = 'hr_project_current_hr_statuses';

    protected $fillable = [
        'hr_project_id',
        'dedicated_hr_team',
        'labor_union_present',
        'labor_relations_stability',
        'evaluation_system_status',
        'compensation_system_status',
        'evaluation_system_issues',
        'job_rank_levels',
        'job_title_levels',
    ];

    protected $casts = [
        'dedicated_hr_team' => 'boolean',
        'labor_union_present' => 'boolean',
    ];

    /**
     * Get the HR project that owns the current HR status.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
