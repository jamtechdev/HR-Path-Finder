<?php

namespace App\Policies;

use App\Enums\StepStatus;
use App\Models\Diagnosis;
use App\Models\User;

class DiagnosisPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Diagnosis $diagnosis): bool
    {
        $company = $diagnosis->hrProject->company;
        return $company->users->contains($user) || 
               $user->hasRole(['consultant', 'admin']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Diagnosis $diagnosis): bool
    {
        $status = $diagnosis->status;
        
        // HR Manager can edit if not submitted/locked
        if ($user->hasRole('hr_manager') && 
            in_array($status, [StepStatus::NOT_STARTED, StepStatus::IN_PROGRESS])) {
            return $diagnosis->hrProject->company->users->contains($user);
        }

        // CEO can edit even if submitted (for review)
        if ($user->hasRole('ceo') && $status === StepStatus::SUBMITTED) {
            return $diagnosis->hrProject->company->users->contains($user);
        }

        return false;
    }

    /**
     * Determine whether the user can submit the diagnosis.
     */
    public function submit(User $user, Diagnosis $diagnosis): bool
    {
        return $user->hasRole('hr_manager') && 
               $diagnosis->hrProject->company->users->contains($user) &&
               $diagnosis->status === StepStatus::IN_PROGRESS;
    }
}
