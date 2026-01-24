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
    ];

    protected $casts = [
        'status' => 'string',
        'current_step' => 'string',
    ];

    /**
     * Get the company that owns the HR project.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
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
     * Get the audit trail for the HR project.
     */
    public function audits(): HasMany
    {
        return $this->hasMany(HrProjectAudit::class);
    }

    /**
     * Get the current step of the project.
     */
    public function getCurrentStep(): ?string
    {
        return $this->current_step;
    }

    /**
     * Check if the project can proceed to a specific step.
     */
    public function canProceedToStep(string $step): bool
    {
        $steps = [
            'diagnosis' => 1,
            'ceo_philosophy' => 2,
            'organization' => 3,
            'performance' => 4,
            'compensation' => 5,
            'consultant_review' => 6,
            'ceo_approval' => 7,
            'dashboard' => 8,
        ];

        $currentStepNumber = $steps[$this->current_step] ?? 0;
        $targetStepNumber = $steps[$step] ?? 0;

        // Can proceed if target is next step and previous is completed
        return $targetStepNumber === $currentStepNumber + 1 && $this->isStepCompleted($this->current_step);
    }

    /**
     * Check if a specific step is completed.
     */
    public function isStepCompleted(string $step): bool
    {
        return match ($step) {
            'diagnosis' => $this->companyAttributes !== null && $this->organizationalSentiment !== null,
            'ceo_philosophy' => $this->ceoPhilosophy !== null && $this->ceoPhilosophy->completed_at !== null,
            'organization' => $this->organizationDesign !== null && $this->organizationDesign->submitted_at !== null,
            'performance' => $this->performanceSystem !== null && $this->performanceSystem->submitted_at !== null,
            'compensation' => $this->compensationSystem !== null && $this->compensationSystem->submitted_at !== null,
            'consultant_review' => $this->consultantReviews()->exists(),
            'ceo_approval' => $this->ceoApprovals()->where('status', 'approved')->exists(),
            default => false,
        };
    }

    /**
     * Lock the HR system (final state).
     */
    public function lock(): void
    {
        $this->update([
            'status' => 'locked',
            'current_step' => 'dashboard',
        ]);
    }

    /**
     * Move to the next step.
     */
    public function moveToNextStep(string $nextStep): void
    {
        $this->update([
            'status' => 'in_progress',
            'current_step' => $nextStep,
        ]);
    }
}
