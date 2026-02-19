<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompensationSnapshotQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_text',
        'answer_type',
        'options',
        'order',
        'is_active',
        'version',
        'metadata',
    ];

    protected $casts = [
        'options' => 'array',
        'is_active' => 'boolean',
        'order' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Get all responses for this question.
     */
    public function responses(): HasMany
    {
        return $this->hasMany(CompensationSnapshotResponse::class, 'question_id');
    }
}
