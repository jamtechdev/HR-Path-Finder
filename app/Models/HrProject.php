<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use App\Enums\StepStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HrProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'status',
        'step_statuses',
    ];

    protected $casts = [
        'status' => ProjectStatus::class,
        'step_statuses' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the company that owns this project.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the diagnosis for this project.
     */
    public function diagnosis(): HasOne
    {
        return $this->hasOne(Diagnosis::class);
    }

    /**
     * Get the CEO philosophy for this project.
     */
    public function ceoPhilosophy(): HasOne
    {
        return $this->hasOne(CeoPhilosophy::class);
    }

    /**
     * Get the company attributes for this project.
     */
    public function companyAttributes(): HasOne
    {
        return $this->hasOne(CompanyAttribute::class);
    }

    /**
     * Get the organizational sentiment for this project.
     */
    public function organizationalSentiment(): HasOne
    {
        return $this->hasOne(OrganizationalSentiment::class);
    }

    /**
     * Get the organization design for this project.
     */
    public function organizationDesign(): HasOne
    {
        return $this->hasOne(OrganizationDesign::class);
    }

    /**
     * Get the performance system for this project.
     */
    public function performanceSystem(): HasOne
    {
        return $this->hasOne(PerformanceSystem::class);
    }

    /**
     * Get the compensation system for this project.
     */
    public function compensationSystem(): HasOne
    {
        return $this->hasOne(CompensationSystem::class);
    }

    /**
     * Get the HR Policy OS for this project.
     */
    public function hrPolicyOs(): HasOne
    {
        return $this->hasOne(HrPolicyOs::class);
    }

    /**
     * Get audit logs for this project.
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get admin comments for this project.
     */
    public function adminComments()
    {
        return $this->hasMany(AdminComment::class);
    }

    /**
     * Get performance snapshot responses for this project.
     */
    public function performanceSnapshotResponses(): HasMany
    {
        return $this->hasMany(PerformanceSnapshotResponse::class);
    }

    /**
     * Get organizational KPIs for this project.
     */
    public function organizationalKpis(): HasMany
    {
        return $this->hasMany(OrganizationalKpi::class);
    }

    /**
     * Get KPI review tokens for this project.
     */
    public function kpiReviewTokens(): HasMany
    {
        return $this->hasMany(KpiReviewToken::class);
    }

    /**
     * Get evaluation model assignments for this project.
     */
    public function evaluationModelAssignments(): HasMany
    {
        return $this->hasMany(EvaluationModelAssignment::class);
    }

    /**
     * Get evaluation structure for this project.
     */
    public function evaluationStructure(): HasOne
    {
        return $this->hasOne(EvaluationStructure::class);
    }

    /**
     * Get compensation snapshot responses for this project.
     */
    public function compensationSnapshotResponses(): HasMany
    {
        return $this->hasMany(CompensationSnapshotResponse::class);
    }

    /**
     * Get base salary framework for this project.
     */
    public function baseSalaryFramework(): HasOne
    {
        return $this->hasOne(BaseSalaryFramework::class);
    }

    /**
     * Get pay bands for this project.
     */
    public function payBands(): HasMany
    {
        return $this->hasMany(PayBand::class)->orderBy('order');
    }

    /**
     * Get salary tables for this project.
     */
    public function salaryTables(): HasMany
    {
        return $this->hasMany(SalaryTable::class)->orderBy('order');
    }

    /**
     * Get pay band operation criteria for this project.
     */
    public function payBandOperationCriteria(): HasOne
    {
        return $this->hasOne(PayBandOperationCriteria::class);
    }

    /**
     * Get bonus pool configuration for this project.
     */
    public function bonusPoolConfiguration(): HasOne
    {
        return $this->hasOne(BonusPoolConfiguration::class);
    }

    /**
     * Get benefits configuration for this project.
     */
    public function benefitsConfiguration(): HasOne
    {
        return $this->hasOne(BenefitsConfiguration::class);
    }

    /**
     * Initialize step statuses if not already set.
     */
    public function initializeStepStatuses(): void
    {
        if (empty($this->step_statuses)) {
            $this->step_statuses = [
                'diagnosis' => StepStatus::NOT_STARTED->value,
                'job_analysis' => StepStatus::NOT_STARTED->value,
                'performance' => StepStatus::NOT_STARTED->value,
                'compensation' => StepStatus::NOT_STARTED->value,
                'hr_policy_os' => StepStatus::NOT_STARTED->value,
            ];
            $this->save();
        }
    }

    /**
     * Get the status of a specific step.
     */
    public function getStepStatus(string $step): ?StepStatus
    {
        $statuses = $this->step_statuses ?? [];
        $status = $statuses[$step] ?? null;

        return $status ? StepStatus::from($status) : null;
    }

    /**
     * Set the status of a specific step.
     */
    public function setStepStatus(string $step, StepStatus $status): void
    {
        $statuses = $this->step_statuses ?? [];
        $statuses[$step] = $status->value;
        $this->step_statuses = $statuses;
        $this->save();
    }

    /**
     * Check if a step is unlocked.
     * A step is unlocked only if the previous step is verified (approved/locked) by CEO.
     */
    public function isStepUnlocked(string $step): bool
    {
        $stepOrder = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'hr_policy_os'];
        $stepIndex = array_search($step, $stepOrder);

        if ($stepIndex === false || $stepIndex === 0) {
            return true; // First step is always unlocked
        }

        $previousStep = $stepOrder[$stepIndex - 1];
        $previousStatus = $this->getStepStatus($previousStep);

        // Previous step must be approved/locked (CEO verified) to unlock next step
        return $previousStatus && in_array($previousStatus, [StepStatus::APPROVED, StepStatus::LOCKED]);
    }

    /**
     * Check if all steps are locked.
     */
    public function isFullyLocked(): bool
    {
        $steps = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'hr_policy_os'];
        
        foreach ($steps as $step) {
            $status = $this->getStepStatus($step);
            if (!$status || $status !== StepStatus::LOCKED) {
                return false;
            }
        }

        return true;
    }
}
