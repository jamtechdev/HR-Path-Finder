<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessProfile extends Model
{
    use HasFactory;

    protected $table = 'business_profiles';

    protected $fillable = [
        'company_id',
        'annual_revenue',
        'operational_margin_rate',
        'annual_human_cost',
        'business_type',
    ];

    /**
     * Get the company that owns the profile.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
