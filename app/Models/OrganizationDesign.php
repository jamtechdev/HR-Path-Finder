<?php

namespace App\Models;

use App\Enums\StepStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationDesign extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'status',
        'structure_type',
        'job_grade_structure',
        'job_grade_details',
    ];

    protected $casts = [
        'status' => StepStatus::class,
        'job_grade_details' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
