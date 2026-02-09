<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PolicySnapshotQuestion extends Model
{
    protected $fillable = [
        'question_text',
        'order',
        'is_active',
        'has_conditional_text',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'has_conditional_text' => 'boolean',
        'order' => 'integer',
    ];
}
