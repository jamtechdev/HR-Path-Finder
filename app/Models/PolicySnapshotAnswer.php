<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PolicySnapshotAnswer extends Model
{
    protected $fillable = [
        'hr_project_id',
        'question_id',
        'answer',
        'conditional_text',
    ];

    protected $casts = [
        'conditional_text' => 'string',
    ];

    /**
     * Get the HR project that owns this answer.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the question that this answer belongs to.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(PolicySnapshotQuestion::class);
    }
}
