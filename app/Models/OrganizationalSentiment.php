<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationalSentiment extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'openness_to_change',
        'trust_level',
        'evaluation_acceptance',
        'reward_sensitivity',
        'conflict_perception',
    ];

    /**
     * Get the HR project that owns the organizational sentiment.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
