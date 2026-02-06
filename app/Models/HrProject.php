<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class HrProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'status',
        'current_step',
        'step_statuses',
    ];

    protected $casts = [
        'step_statuses' => 'array',
    ];

    /**
     * Get the company that owns the HR project.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the business profile for the HR project.
     * Note: BusinessProfile uses company_id, not hr_project_id
     */
    public function businessProfile(): HasOne
    {
        return $this->hasOne(BusinessProfile::class, 'company_id', 'company_id');
    }

    /**
     * Get the workforce details for the HR project.
     * Note: Workforce uses company_id, not hr_project_id
     */
    public function workforce(): HasOne
    {
        return $this->hasOne(Workforce::class, 'company_id', 'company_id');
    }

    /**
     * Get the current HR status for the HR project.
     * Note: CurrentHrStatus uses company_id, not hr_project_id
     */
    public function currentHrStatus(): HasOne
    {
        return $this->hasOne(CurrentHrStatus::class, 'company_id', 'company_id');
    }

    /**
     * Get the culture details for the HR project.
     * Note: Culture uses company_id, not hr_project_id
     */
    public function culture(): HasOne
    {
        return $this->hasOne(Culture::class, 'company_id', 'company_id');
    }

    /**
     * Get the confidential note for the HR project.
     * Note: ConfidentialNote uses company_id, not hr_project_id
     */
    public function confidentialNote(): HasOne
    {
        return $this->hasOne(ConfidentialNote::class, 'company_id', 'company_id');
    }

    /**
     * Get the CEO philosophy survey for the HR project.
     */
    public function ceoPhilosophy(): HasOne
    {
        return $this->hasOne(CeoPhilosophy::class);
    }

    /**
     * Get the organization design for the HR project.
     */
    public function organizationDesign(): HasOne
    {
        return $this->hasOne(OrganizationDesign::class);
    }

    /**
     * Get the performance system for the HR project.
     */
    public function performanceSystem(): HasOne
    {
        return $this->hasOne(PerformanceSystem::class);
    }

    /**
     * Get the compensation system for the HR project.
     */
    public function compensationSystem(): HasOne
    {
        return $this->hasOne(CompensationSystem::class);
    }

    /**
     * Get the company attributes for the HR project.
     */
    public function companyAttributes(): HasOne
    {
        return $this->hasOne(CompanyAttribute::class);
    }

    /**
     * Get the organizational sentiment for the HR project.
     */
    public function organizationalSentiment(): HasOne
    {
        return $this->hasOne(OrganizationalSentiment::class);
    }

    /**
     * Get the consultant reviews for the HR project.
     */
    public function consultantReviews(): HasMany
    {
        return $this->hasMany(ConsultantReview::class);
    }

    /**
     * Get the CEO approvals for the HR project.
     */
    public function ceoApprovals(): HasMany
    {
        return $this->hasMany(CeoApproval::class);
    }

    /**
     * Get the audits for the HR project.
     */
    public function audits(): HasMany
    {
        return $this->hasMany(HrProjectAudit::class);
    }

    /**
     * Initialize step statuses if not already set.
     */
    public function initializeStepStatuses(): void
    {
        if ($this->step_statuses === null || empty($this->step_statuses)) {
            $this->step_statuses = [
                'diagnosis' => 'not_started',
                'organization' => 'not_started',
                'performance' => 'not_started',
                'compensation' => 'not_started',
            ];
            $this->save();
        }
    }

    /**
     * Get the status for a specific step.
     */
    public function getStepStatus(string $step): string
    {
        $this->initializeStepStatuses();
        return $this->step_statuses[$step] ?? 'not_started';
    }

    /**
     * Set the status for a specific step.
     */
    public function setStepStatus(string $step, string $status): void
    {
        $this->initializeStepStatuses();
        
        // Get the array, modify it, and set it back (required for JSON cast)
        $stepStatuses = $this->step_statuses ?? [];
        $stepStatuses[$step] = $status;
        $this->step_statuses = $stepStatuses;
        
        $this->save();
    }

    /**
     * Check if a step is unlocked.
     * A step is unlocked if:
     * - It's the first step (diagnosis)
     * - The previous step is 'submitted' or 'completed'
     */
    public function isStepUnlocked(string $step): bool
    {
        $stepOrder = ['diagnosis', 'organization', 'performance', 'compensation'];
        $stepIndex = array_search($step, $stepOrder);

        // First step is always unlocked
        if ($stepIndex === 0) {
            return true;
        }

        // If step not found, return false
        if ($stepIndex === false) {
            return false;
        }

        // Get previous step
        $previousStep = $stepOrder[$stepIndex - 1];
        $previousStatus = $this->getStepStatus($previousStep);

        // Step is unlocked only if previous step is completed (CEO verified)
        // 'submitted' means waiting for CEO verification, so it should remain locked
        return $previousStatus === 'completed';
    }

    /**
     * Check if a step is verified (completed by CEO).
     */
    public function isStepVerified(string $step): bool
    {
        $status = $this->getStepStatus($step);
        return $status === 'completed';
    }

    /**
     * Mark a step as verified (completed by CEO).
     */
    public function markStepAsVerified(string $step): void
    {
        $this->setStepStatus($step, 'completed');
    }

    /**
     * Get the CEO user for this project's company.
     */
    public function getCeoUser()
    {
        return $this->company
            ->users()
            ->wherePivot('role', 'ceo')
            ->first();
    }
}
