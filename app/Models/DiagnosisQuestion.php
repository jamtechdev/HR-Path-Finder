<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiagnosisQuestion extends Model
{
    protected $fillable = [
        'category',
        'question_text',
        'question_type',
        'order',
        'is_active',
        'metadata',
        'options',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
        'options' => 'array',
        'order' => 'integer',
    ];
}
