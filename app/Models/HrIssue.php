<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HrIssue extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'issue_type',
        'is_custom',
        'description',
    ];

    protected $casts = [
        'is_custom' => 'boolean',
    ];

    /**
     * Get the company that owns the HR issue record.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
