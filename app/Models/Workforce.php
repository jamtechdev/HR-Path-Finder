<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Workforce extends Model
{
    use HasFactory;

    protected $table = 'workforces';

    protected $fillable = [
        'company_id',
        'headcount_year_minus_2',
        'headcount_year_minus_1',
        'headcount_current',
        'total_employees',
        'contract_employees',
        'org_chart_path',
    ];

    /**
     * Get the company that owns the workforce record.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
