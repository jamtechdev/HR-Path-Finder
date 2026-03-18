<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KpiTemplate extends Model
{
    protected $fillable = [
        'company_id',
        'org_unit_name',
        'kpi_name',
        'purpose',
        'category',
        'formula',
        'measurement_method',
        'weight',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
