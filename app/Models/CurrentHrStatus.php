<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurrentHrStatus extends Model
{
    use HasFactory;

    protected $table = 'current_hr_statuses';

    protected $fillable = [
        'company_id',
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
     * Get the company that owns the current HR status.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
