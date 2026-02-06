<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationalChart extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'chart_year_month',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Get the company that owns the organizational chart record.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
