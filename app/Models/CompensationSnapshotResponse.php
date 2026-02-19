<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompensationSnapshotResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'question_id',
        'response',
        'text_response',
        'numeric_response',
    ];

    protected $casts = [
        'response' => 'array',
        'numeric_response' => 'decimal:2',
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
        return $this->belongsTo(CompensationSnapshotQuestion::class, 'question_id');
    }
}
