<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BaseSalaryFramework extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'salary_structure_type',
        'salary_adjustment_unit',
        'salary_adjustment_grouping',
        'salary_adjustment_timing',
        'salary_determination_standard',
        'common_salary_increase_rate',
        'common_increase_rate_basis',
        'performance_based_increase_differentiation',
    ];

    protected $casts = [
        'salary_adjustment_timing' => 'array',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
