<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalaryTable extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'job_role',
        'grade',
        'years_in_grade',
        'level_1',
        'level_2',
        'level_3',
        'level_4',
        'level_5',
        'explanation',
        'order',
    ];

    protected $casts = [
        'level_1' => 'decimal:2',
        'level_2' => 'decimal:2',
        'level_3' => 'decimal:2',
        'level_4' => 'decimal:2',
        'level_5' => 'decimal:2',
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
     * Get the performance increases for this salary table.
     */
    public function performanceIncreases(): HasMany
    {
        return $this->hasMany(SalaryTablePerformanceIncrease::class);
    }
}
