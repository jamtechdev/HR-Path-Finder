<?php

namespace App\Models;

use App\Enums\StepStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompensationSystem extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'status',
        'compensation_structure',
        'incentive_types',
        'differentiation_logic',
    ];

    protected $casts = [
        'status' => StepStatus::class,
        'incentive_types' => 'array',
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
