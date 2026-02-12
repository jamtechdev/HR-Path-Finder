<?php

namespace App\Models;

use App\Enums\StepStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HrPolicyOs extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'status',
        'policy_manual',
        'system_handbook',
        'implementation_roadmap',
        'analytics_blueprint',
        'customizations',
    ];

    protected $casts = [
        'status' => StepStatus::class,
        'policy_manual' => 'array',
        'system_handbook' => 'array',
        'implementation_roadmap' => 'array',
        'analytics_blueprint' => 'array',
        'customizations' => 'array',
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
