<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceSystem extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'performance_unit',
        'performance_method',
        'evaluation_structure_quantitative',
        'evaluation_structure_relative',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    /**
     * Get the HR project that owns the performance system.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
