<?php

namespace App\Models;

use App\Enums\StepStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Diagnosis extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'status',
        'industry_category',
        'industry_subcategory',
        'industry_other',
        'present_headcount',
        'expected_headcount_1y',
        'expected_headcount_2y',
        'expected_headcount_3y',
        'average_tenure_active',
        'average_tenure_leavers',
        'average_age',
        'gender_male',
        'gender_female',
        'gender_other',
        'gender_ratio',
        'total_executives',
        'executive_positions',
        'leadership_count',
        'leadership_percentage',
        'job_grade_names',
        'promotion_years',
        'organizational_charts',
        'org_structure_types',
        'org_structure_explanations',
        'hr_issues',
        'custom_hr_issues',
        'job_categories',
        'job_functions',
    ];

    protected $casts = [
        'status' => StepStatus::class,
        'executive_positions' => 'array',
        'job_grade_names' => 'array',
        'promotion_years' => 'array',
        'organizational_charts' => 'array',
        'org_structure_types' => 'array',
        'org_structure_explanations' => 'array',
        'hr_issues' => 'array',
        'job_categories' => 'array',
        'job_functions' => 'array',
        'gender_ratio' => 'decimal:2',
        'leadership_percentage' => 'decimal:2',
        'average_tenure_active' => 'decimal:2',
        'average_tenure_leavers' => 'decimal:2',
        'average_age' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the HR project that owns this diagnosis.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Calculate and set gender ratio automatically.
     */
    public function calculateGenderRatio(): void
    {
        $total = ($this->gender_male ?? 0) + ($this->gender_female ?? 0) + ($this->gender_other ?? 0);
        
        if ($total > 0) {
            $this->gender_ratio = round((($this->gender_male ?? 0) / $total) * 100, 2);
        } else {
            $this->gender_ratio = null;
        }
    }

    /**
     * Calculate and set leadership percentage.
     */
    public function calculateLeadershipPercentage(): void
    {
        if ($this->present_headcount && $this->leadership_count) {
            $this->leadership_percentage = round(($this->leadership_count / $this->present_headcount) * 100, 2);
        }
    }

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::saving(function ($diagnosis) {
            $diagnosis->calculateGenderRatio();
            $diagnosis->calculateLeadershipPercentage();
        });
    }
}
