<?php

namespace App\Policies;

use App\Enums\StepStatus;
use App\Models\HrProject;
use App\Models\User;

class StepPolicy
{
    /**
     * Determine whether the user can access a step.
     */
    public function access(User $user, HrProject $hrProject, string $step): bool
    {
        // Consultant/Admin can always view
        if ($user->hasRole(['consultant', 'admin'])) {
            return true;
        }

        // Check if user is associated with company
        if (!$hrProject->company->users->contains($user)) {
            return false;
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked($step)) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can edit a step.
     */
    public function edit(User $user, HrProject $hrProject, string $step): bool
    {
        if (!$user->hasRole('hr_manager')) {
            return false;
        }

        if (!$hrProject->company->users->contains($user)) {
            return false;
        }

        $status = $hrProject->getStepStatus($step);
        
        return $status && in_array($status, [StepStatus::NOT_STARTED, StepStatus::IN_PROGRESS]);
    }

    /**
     * Determine whether the user can submit a step.
     */
    public function submit(User $user, HrProject $hrProject, string $step): bool
    {
        if (!$user->hasRole('hr_manager')) {
            return false;
        }

        if (!$hrProject->company->users->contains($user)) {
            return false;
        }

        $status = $hrProject->getStepStatus($step);
        
        return $status === StepStatus::IN_PROGRESS;
    }
}
