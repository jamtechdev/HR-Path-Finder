<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompensationSystem extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'compensation_structure',
        'differentiation_method',
        'incentive_components',
        'submitted_at',
    ];

    protected $casts = [
        'incentive_components' => 'array',
        'submitted_at' => 'datetime',
    ];

    /**
     * Get the HR project that owns the compensation system.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
