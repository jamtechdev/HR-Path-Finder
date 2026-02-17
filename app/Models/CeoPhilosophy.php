<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CeoPhilosophy extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'user_id',
        'survey_responses',
        'management_philosophy_responses',
        'vision_mission_responses',
        'growth_stage',
        'leadership_responses',
        'general_responses',
        'organizational_issues',
        'concerns',
        'main_trait',
        'secondary_trait',
        'completed_at',
    ];

    protected $casts = [
        'survey_responses' => 'array',
        'management_philosophy_responses' => 'array',
        'vision_mission_responses' => 'array',
        'leadership_responses' => 'array',
        'general_responses' => 'array',
        'organizational_issues' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the CEO user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
