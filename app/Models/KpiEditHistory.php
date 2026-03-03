<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KpiEditHistory extends Model
{
    use HasFactory;

    protected $table = 'kpi_edit_history';

    protected $fillable = [
        'organizational_kpi_id',
        'edited_by_type',
        'edited_by_id',
        'edited_by_name',
        'changes',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    /**
     * Get the organizational KPI that this edit history belongs to.
     */
    public function organizationalKpi(): BelongsTo
    {
        return $this->belongsTo(OrganizationalKpi::class);
    }

    /**
     * Scope to filter by editor type.
     */
    public function scopeByEditorType($query, string $type)
    {
        return $query->where('edited_by_type', $type);
    }
}
