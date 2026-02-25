<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CeoRoleAssignmentController extends Controller
{
    /**
     * Assign CEO and HR Manager roles to logged-in user and associate with company.
     */
    public function assignRoles(Request $request)
    {
        $request->validate([
            'company_id' => ['required', 'exists:companies,id'],
            'assign_hr_manager_role' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $company = Company::findOrFail($request->company_id);

        // Check if user is already a member
        $isCompanyMember = $company->users->contains($user);
        $existingCompanyRoles = [];
        if ($isCompanyMember) {
            $existingCompanyRoles = $company->users()
                ->where('users.id', $user->id)
                ->pluck('company_users.role')
                ->toArray();
        }

        // Assign CEO role if not already assigned
        if (!$user->hasRole('ceo')) {
            $user->assignRole('ceo');
        }

        // Associate user with company as CEO if not already associated
        if (!in_array('ceo', $existingCompanyRoles)) {
            $company->users()->syncWithoutDetaching([
                $user->id => ['role' => 'ceo'],
            ]);
        }

        // If HR Manager role is requested
        if ($request->boolean('assign_hr_manager_role')) {
            if (!$user->hasRole('hr_manager')) {
                $user->assignRole('hr_manager');
            }
            // Associate as HR Manager with the company if not already associated
            if (!in_array('hr_manager', $existingCompanyRoles)) {
                $company->users()->syncWithoutDetaching([
                    $user->id => ['role' => 'hr_manager'],
                ]);
            }
        }

        return back()->with('success', 'CEO role has been successfully assigned. You can now access the CEO dashboard.');
    }
}
