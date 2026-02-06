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
        'expected_workforce_1_year',
        'expected_workforce_2_years',
        'expected_workforce_3_years',
        'average_tenure_active',
        'average_tenure_leavers',
        'average_age_active',
        'male_employees',
        'female_employees',
        'total_leaders_above_team_leader',
        'leaders_percentage',
    ];

    protected $casts = [
        'average_tenure_active' => 'decimal:2',
        'average_tenure_leavers' => 'decimal:2',
        'average_age_active' => 'decimal:2',
        'leaders_percentage' => 'decimal:2',
    ];

    /**
     * Get the company that owns the workforce record.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
