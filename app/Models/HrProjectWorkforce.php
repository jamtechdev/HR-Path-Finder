<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HrProjectWorkforce extends Model
{
    use HasFactory;

    protected $table = 'hr_project_workforces';

    protected $fillable = [
        'hr_project_id',
        'headcount_year_minus_2',
        'headcount_year_minus_1',
        'headcount_current',
        'total_employees',
        'contract_employees',
        'org_chart_path',
    ];

    /**
     * Get the HR project that owns the workforce record.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
