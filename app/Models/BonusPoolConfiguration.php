<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BonusPoolConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'payment_trigger_condition',
        'bonus_pool_determination_criteria',
        'bonus_pool_determination_method',
        'eligibility_scope',
        'eligibility_criteria',
        'inclusion_of_employees_on_leave',
        'bonus_calculation_unit',
        'allocation_scope',
        'allocation_criteria',
        'bonus_pool_finalization_timing',
        'bonus_payment_month',
        'calculation_period_start',
        'calculation_period_end',
    ];

    protected $casts = [
        'allocation_criteria' => 'array',
        'calculation_period_start' => 'date',
        'calculation_period_end' => 'date',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
