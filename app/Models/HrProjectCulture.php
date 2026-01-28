<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HrProjectCulture extends Model
{
    use HasFactory;

    protected $table = 'hr_project_cultures';

    protected $fillable = [
        'hr_project_id',
        'work_format',
        'decision_making_style',
        'core_values',
    ];

    protected $casts = [
        'core_values' => 'array',
    ];

    /**
     * Get the HR project that owns the culture record.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
