<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KpiEditHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'kpi_id',
        'editor_name',
        'editor_email',
        'action',
        'old_values',
        'new_values',
        'change_description',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    /**
     * Get the KPI.
     */
    public function kpi(): BelongsTo
    {
        return $this->belongsTo(OrganizationalKpi::class, 'kpi_id');
    }
}
