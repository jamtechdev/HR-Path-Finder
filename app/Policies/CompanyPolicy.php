<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;

class CompanyPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['ceo', 'hr_manager', 'consultant']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Company $company): bool
    {
        // User must be associated with the company
        return $company->users->contains($user) || 
               $user->hasRole('consultant'); // Consultants can view all companies
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
    public function update(User $user, Company $company): bool
    {
        // HR Manager who created it or CEO of the company
        if ($company->created_by === $user->id && $user->hasRole('hr_manager')) {
            return true;
        }

        if ($company->users->contains($user) && $user->hasRole('ceo')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Company $company): bool
    {
        // Only the creator (HR Manager) can delete
        return $company->created_by === $user->id && $user->hasRole('hr_manager');
    }
}
