<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Culture extends Model
{
    use HasFactory;

    protected $table = 'cultures';

    protected $fillable = [
        'company_id',
        'work_format',
        'decision_making_style',
        'core_values',
    ];

    protected $casts = [
        'core_values' => 'array',
    ];

    /**
     * Get the company that owns the culture record.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
