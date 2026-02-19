<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BenefitsConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'previous_year_total_salary',
        'previous_year_total_benefits_expense',
        'benefits_expense_ratio',
        'benefits_strategic_direction',
        'current_benefits_programs',
        'future_programs',
    ];

    protected $casts = [
        'previous_year_total_salary' => 'decimal:2',
        'previous_year_total_benefits_expense' => 'decimal:2',
        'benefits_expense_ratio' => 'decimal:2',
        'benefits_strategic_direction' => 'array',
        'current_benefits_programs' => 'array',
        'future_programs' => 'array',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
