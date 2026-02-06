<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobGrade extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'grade_name',
        'grade_order',
        'promotion_rules',
        'promotion_to_grade',
    ];

    protected $casts = [
        'grade_order' => 'integer',
    ];

    /**
     * Get the company that owns the job grade record.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
