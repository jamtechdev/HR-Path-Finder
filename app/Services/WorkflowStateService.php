<?php

namespace App\Services;

use App\Enums\StepStatus;
use App\Models\HrProject;
use Illuminate\Support\Facades\Log;

class WorkflowStateService
{
    /**
     * Unlock the next step after a step is approved/locked.
     */
    public function unlockNextStep(HrProject $project, string $completedStep): void
    {
        $stepOrder = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'tree', 'conclusion'];
        $stepIndex = array_search($completedStep, $stepOrder);

        if ($stepIndex === false || $stepIndex === count($stepOrder) - 1) {
            return; // Last step or invalid step
        }

        $nextStep = $stepOrder[$stepIndex + 1];
        $currentStatus = $project->getStepStatus($nextStep);

        // Only unlock if not already started
        if (!$currentStatus || $currentStatus === StepStatus::NOT_STARTED) {
            $project->setStepStatus($nextStep, StepStatus::IN_PROGRESS);
            
            Log::info("Unlocked step: {$nextStep} for project {$project->id}");
        }
    }

    /**
     * Check if a step can be unlocked.
     */
    public function canUnlockStep(HrProject $project, string $step): bool
    {
        return $project->isStepUnlocked($step);
    }

    /**
     * Get the current workflow state.
     */
    public function getWorkflowState(HrProject $project): array
    {
        $steps = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'tree', 'conclusion'];
        $state = [];

        foreach ($steps as $step) {
            $status = $project->getStepStatus($step);
            $state[$step] = [
                'status' => $status?->value ?? StepStatus::NOT_STARTED->value,
                'is_unlocked' => $project->isStepUnlocked($step),
                'can_edit' => $status?->canEdit() ?? false,
            ];
        }

        return $state;
    }
}
