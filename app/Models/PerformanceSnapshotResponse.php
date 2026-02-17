<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceSnapshotResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'question_id',
        'response',
        'text_response',
    ];

    protected $casts = [
        'response' => 'array',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the question.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(PerformanceSnapshotQuestion::class, 'question_id');
    }
}
