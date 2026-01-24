<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyAttribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'job_standardization_level',
        'performance_measurability',
    ];

    /**
     * Get the HR project that owns the company attributes.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
