<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RoleSwitchController extends Controller
{
    /**
     * Switch HR Manager to CEO role for a company.
     */
    public function switchToCeo(Request $request)
    {
        $user = $request->user();
        
        // Ensure user is HR Manager
        if (!$user->hasRole('hr_manager')) {
            abort(403, 'Only HR Managers can switch to CEO role.');
        }

        $request->validate([
            'company_id' => ['required', 'exists:companies,id'],
        ]);

        $company = Company::findOrFail($request->company_id);

        // Check if user is associated with this company as HR Manager
        if (!$company->users->contains($user) || 
            !$company->users()->where('users.id', $user->id)->wherePivot('role', 'hr_manager')->exists()) {
            return back()->withErrors(['company_id' => 'You must be the HR Manager of this company to switch to CEO role.']);
        }

        // Check if user already has CEO role for this company
        if ($company->users()->where('users.id', $user->id)->wherePivot('role', 'ceo')->exists()) {
            return back()->withErrors(['company_id' => 'You already have CEO role for this company.']);
        }

        // Assign CEO role if not already assigned
        if (!$user->hasRole('ceo')) {
            $user->assignRole('ceo');
        }

        // Associate user with company as CEO
        $company->users()->syncWithoutDetaching([
            $user->id => ['role' => 'ceo'],
        ]);

        // Store active role in session (so we know they switched from HR to CEO)
        $request->session()->put('active_role', 'ceo');
        $request->session()->put('switched_company_id', $company->id);

        Log::info('HR Manager switched to CEO role', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'company_id' => $company->id,
            'company_name' => $company->name,
        ]);

        return redirect()->route('ceo.dashboard')
            ->with('success', 'You have successfully switched to CEO role. You can now access the CEO dashboard.');
    }

    /**
     * Switch back to HR Manager role.
     */
    public function switchToHr(Request $request)
    {
        $user = $request->user();
        
        // Clear active role from session
        $request->session()->forget('active_role');
        $request->session()->forget('switched_company_id');

        Log::info('User switched back to HR Manager role', [
            'user_id' => $user->id,
            'user_email' => $user->email,
        ]);

        return redirect()->route('hr-manager.dashboard')
            ->with('success', 'You have switched back to HR Manager role.');
    }
}
