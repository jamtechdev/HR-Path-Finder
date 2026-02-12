<?php

namespace App\Services;

use App\Enums\StepStatus;
use App\Models\HrProject;
use App\Services\AuditLogService;
use App\Services\WorkflowStateService;
use Illuminate\Support\Facades\Auth;

class StepTransitionService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected WorkflowStateService $workflowStateService
    ) {
    }

    /**
     * Transition a step to submitted status.
     */
    public function submitStep(HrProject $project, string $step): void
    {
        $currentStatus = $project->getStepStatus($step);
        
        if (!$currentStatus || !in_array($currentStatus, [StepStatus::NOT_STARTED, StepStatus::IN_PROGRESS])) {
            throw new \Exception("Step {$step} cannot be submitted from current status");
        }

        $project->setStepStatus($step, StepStatus::SUBMITTED);
        
        $this->auditLogService->logStepStatusChange(
            $project,
            Auth::user(),
            $step,
            $currentStatus->value,
            StepStatus::SUBMITTED->value
        );
    }

    /**
     * Approve and lock a step.
     */
    public function approveAndLockStep(HrProject $project, string $step): void
    {
        $currentStatus = $project->getStepStatus($step);
        
        if ($currentStatus !== StepStatus::SUBMITTED) {
            throw new \Exception("Step {$step} must be submitted before approval");
        }

        // Update the specific model status if it exists
        $this->updateModelStatus($project, $step, StepStatus::APPROVED);
        
        $project->setStepStatus($step, StepStatus::APPROVED);
        
        $this->auditLogService->logStepStatusChange(
            $project,
            Auth::user(),
            $step,
            $currentStatus->value,
            StepStatus::APPROVED->value
        );

        // Lock the step
        $this->updateModelStatus($project, $step, StepStatus::LOCKED);
        $project->setStepStatus($step, StepStatus::LOCKED);
        
        $this->auditLogService->logStepStatusChange(
            $project,
            Auth::user(),
            $step,
            StepStatus::APPROVED->value,
            StepStatus::LOCKED->value
        );

        // Unlock next step
        $this->workflowStateService->unlockNextStep($project, $step);
    }

    /**
     * Update the status of the specific model for a step.
     */
    protected function updateModelStatus(HrProject $project, string $step, StepStatus $status): void
    {
        switch ($step) {
            case 'diagnosis':
                $model = $project->diagnosis;
                if ($model) {
                    $model->update(['status' => $status]);
                }
                break;
            case 'job_analysis':
                $model = $project->organizationDesign;
                if ($model) {
                    $model->update(['status' => $status]);
                }
                break;
            case 'performance':
                $model = $project->performanceSystem;
                if ($model) {
                    $model->update(['status' => $status]);
                }
                break;
            case 'compensation':
                $model = $project->compensationSystem;
                if ($model) {
                    $model->update(['status' => $status]);
                }
                break;
            case 'hr_policy_os':
                $model = $project->hrPolicyOs;
                if ($model) {
                    $model->update(['status' => $status]);
                }
                break;
        }
    }

    /**
     * Lock all steps (final approval).
     */
    public function lockAllSteps(HrProject $project): void
    {
        $steps = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'hr_policy_os'];
        
        foreach ($steps as $step) {
            $currentStatus = $project->getStepStatus($step);
            if ($currentStatus && $currentStatus !== StepStatus::LOCKED) {
                // Update model status
                $this->updateModelStatus($project, $step, StepStatus::LOCKED);
                
                // Update project step status
                $project->setStepStatus($step, StepStatus::LOCKED);
                
                $this->auditLogService->logStepStatusChange(
                    $project,
                    Auth::user(),
                    $step,
                    $currentStatus->value,
                    StepStatus::LOCKED->value
                );
            }
        }

        // Update project status to locked
        $project->status = \App\Enums\ProjectStatus::LOCKED;
        $project->save();
    }
}
