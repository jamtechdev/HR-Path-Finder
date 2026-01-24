<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessProfile extends Model
{
    use HasFactory;

    protected $table = 'hr_project_business_profiles';

    protected $fillable = [
        'hr_project_id',
        'annual_revenue',
        'operational_margin_rate',
        'annual_human_cost',
        'business_type',
    ];

    /**
     * Get the HR project that owns the profile.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
