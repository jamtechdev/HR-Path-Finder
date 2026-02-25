<?php

namespace App\Http\Controllers;

use App\Models\CeoRoleRequest;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CeoRoleRequestController extends Controller
{
    /**
     * Store a new CEO role request.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        // Ensure user is HR Manager
        if (!$user->hasRole('hr_manager')) {
            abort(403, 'Only HR Managers can request CEO role.');
        }

        $request->validate([
            'company_id' => ['required', 'exists:companies,id'],
        ]);

        $company = Company::findOrFail($request->company_id);

        // Check if user is associated with this company as HR Manager
        if (!$company->users->contains($user) || 
            !$company->users()->where('users.id', $user->id)->wherePivot('role', 'hr_manager')->exists()) {
            return back()->withErrors(['company_id' => 'You must be the HR Manager of this company to request CEO role.']);
        }

        // Check if user already has CEO role for this company
        if ($company->users()->where('users.id', $user->id)->wherePivot('role', 'ceo')->exists()) {
            return back()->withErrors(['company_id' => 'You already have CEO role for this company.']);
        }

        // Check if there's already a pending request
        $existingRequest = CeoRoleRequest::where('user_id', $user->id)
            ->where('company_id', $company->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return back()->withErrors(['company_id' => 'You already have a pending CEO role request for this company.']);
        }

        // Create request
        $ceoRequest = CeoRoleRequest::create([
            'user_id' => $user->id,
            'company_id' => $company->id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        Log::info('CEO Role Request Created', [
            'request_id' => $ceoRequest->id,
            'user_id' => $user->id,
            'user_email' => $user->email,
            'company_id' => $company->id,
            'company_name' => $company->name,
        ]);

        return back()->with('success', 'CEO role request submitted successfully. Admin will review your request.');
    }
}
