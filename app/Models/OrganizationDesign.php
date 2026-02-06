<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationDesign extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'structure_type',
        'structure_types',
        'job_grade_structure',
        'grade_title_relationship',
        'managerial_role_definition',
        'submitted_at',
    ];

    protected $casts = [
        'structure_types' => 'array',
        'submitted_at' => 'datetime',
    ];

    /**
     * Get the HR project that owns the organization design.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
