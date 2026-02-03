<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'brand_name',
        'foundation_date',
        'hq_location',
        'industry',
        'secondary_industries',
        'size',
        'growth_stage',
        'logo_path',
        'image_path',
        'latitude',
        'longitude',
        'created_by',
        'diagnosis_status',
        'organization_status',
        'performance_status',
        'compensation_status',
        'ceo_survey_status',
        'overall_status',
    ];

    protected $casts = [
        'foundation_date' => 'date',
        'secondary_industries' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get the user who created the company.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the users that belong to the company.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'company_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get the invitations for the company.
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(CompanyInvitation::class);
    }

    /**
     * Get the business profile for the company.
     */
    public function businessProfile(): HasOne
    {
        return $this->hasOne(BusinessProfile::class);
    }

    /**
     * Get the workforce details for the company.
     */
    public function workforce(): HasOne
    {
        return $this->hasOne(Workforce::class);
    }

    /**
     * Get the current HR status for the company.
     */
    public function currentHrStatus(): HasOne
    {
        return $this->hasOne(CurrentHrStatus::class);
    }

    /**
     * Get the culture details for the company.
     */
    public function culture(): HasOne
    {
        return $this->hasOne(Culture::class);
    }

    /**
     * Get the confidential notes for the company.
     */
    public function confidentialNote(): HasOne
    {
        return $this->hasOne(ConfidentialNote::class);
    }

    /**
     * Get the organization design for the company.
     */
    public function organizationDesign(): HasOne
    {
        return $this->hasOne(OrganizationDesign::class);
    }

    /**
     * Get the performance system for the company.
     */
    public function performanceSystem(): HasOne
    {
        return $this->hasOne(PerformanceSystem::class);
    }

    /**
     * Get the compensation system for the company.
     */
    public function compensationSystem(): HasOne
    {
        return $this->hasOne(CompensationSystem::class);
    }

    /**
     * Get the CEO philosophy survey for the company.
     */
    public function ceoPhilosophy(): HasOne
    {
        return $this->hasOne(CeoPhilosophy::class);
    }

    /**
     * Check if diagnosis is completed.
     */
    public function isDiagnosisCompleted(): bool
    {
        return $this->diagnosis_status === 'completed';
    }

    /**
     * Check if organization is completed.
     */
    public function isOrganizationCompleted(): bool
    {
        return $this->organization_status === 'completed';
    }

    /**
     * Check if performance is completed.
     */
    public function isPerformanceCompleted(): bool
    {
        return $this->performance_status === 'completed';
    }

    /**
     * Check if compensation is completed.
     */
    public function isCompensationCompleted(): bool
    {
        return $this->compensation_status === 'completed';
    }

    /**
     * Check if CEO survey is completed.
     */
    public function isCeoSurveyCompleted(): bool
    {
        return $this->ceo_survey_status === 'completed';
    }
}
