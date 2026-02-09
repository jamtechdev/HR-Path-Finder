<?php

namespace App\Policies;

use App\Models\HrProject;
use App\Models\User;

class HrProjectPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['hr_manager', 'ceo', 'consultant', 'admin']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, HrProject $hrProject): bool
    {
        // User must be associated with the company or be consultant/admin
        return $hrProject->company->users->contains($user) || 
               $user->hasRole(['consultant', 'admin']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('hr_manager');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, HrProject $hrProject): bool
    {
        // HR Manager can update if associated with company
        if ($user->hasRole('hr_manager') && $hrProject->company->users->contains($user)) {
            return true;
        }

        // CEO can update if associated with company
        if ($user->hasRole('ceo') && $hrProject->company->users->contains($user)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, HrProject $hrProject): bool
    {
        // Only HR Manager who created the company can delete
        return $user->hasRole('hr_manager') && 
               $hrProject->company->created_by === $user->id;
    }
}
