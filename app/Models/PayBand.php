<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayBand extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'job_grade',
        'min_salary',
        'max_salary',
        'target_salary',
        'width',
        'factor_a',
        'factor_b',
        'min_setting_rate_1_2',
        'min_setting_rate_3_plus',
        'target_rate_increase_1_2',
        'target_rate_increase_3_plus',
        'order',
    ];

    protected $casts = [
        'min_salary' => 'decimal:2',
        'max_salary' => 'decimal:2',
        'target_salary' => 'decimal:2',
        'width' => 'decimal:2',
        'factor_a' => 'decimal:4',
        'factor_b' => 'decimal:4',
        'min_setting_rate_1_2' => 'decimal:2',
        'min_setting_rate_3_plus' => 'decimal:2',
        'target_rate_increase_1_2' => 'decimal:2',
        'target_rate_increase_3_plus' => 'decimal:2',
        'order' => 'integer',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the zones for this pay band.
     */
    public function zones(): HasMany
    {
        return $this->hasMany(PayBandZone::class);
    }
}
