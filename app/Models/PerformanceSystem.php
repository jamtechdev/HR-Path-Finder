<?php

namespace App\Models;

use App\Enums\StepStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceSystem extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'status',
        'evaluation_unit',
        'performance_method',
        'evaluation_logic',
    ];

    protected $casts = [
        'status' => StepStatus::class,
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
