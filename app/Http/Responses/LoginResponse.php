<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request): Response
    {
        $user = $request->user();
        
        // Reload user with roles to ensure they're loaded
        $user->load('roles');
        
        // Get user's primary role
        $role = $user->roles->first()?->name;

        // Check email verification for HR Manager - redirect to verification page if not verified
        if ($role === 'hr_manager' && !$user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice')
                ->with('warning', 'Please verify your email address before accessing the dashboard.');
        }

        // Check if CEO just joined via invitation - redirect to company page for onboarding
        if ($role === 'ceo') {
            $user->load('companies');
            $company = $user->companies()->wherePivot('role', 'ceo')->latest('company_users.created_at')->first();
            
            // Check if CEO has a company and if they haven't completed the philosophy survey yet
            if ($company) {
                $hrProject = $company->hrProjects()->latest()->first();
                
                // If there's a project, show CEO the diagnosis workspace (same as HR manager sees)
                if ($hrProject) {
                    $hrProject->initializeStepStatuses();
                    $ceoPhilosophy = $hrProject->ceoPhilosophy;
                    $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
                    
                    // If diagnosis is submitted but CEO hasn't completed survey, redirect to survey
                    if ($diagnosisStatus === 'submitted' && (!$ceoPhilosophy || !$ceoPhilosophy->completed_at)) {
                        return redirect()->route('ceo.hr-projects.ceo-philosophy.show', $hrProject->id)
                            ->with('success', 'Welcome! Please complete the Management Philosophy Survey to verify Step 1: Diagnosis.');
                    }
                    
                    // If survey completed OR diagnosis not yet submitted, show diagnosis workspace
                    // CEO can review diagnosis and see the same workspace as HR manager
                    return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                        'projectId' => $hrProject->id,
                        'tab' => 'overview'
                    ])->with('success', 'Welcome! You can review the diagnosis for ' . $company->name . '.');
                } else {
                    // No project yet, but CEO is attached - show company page
                    return redirect()->route('companies.show', $company->id)
                        ->with('success', 'Welcome! You have successfully joined ' . $company->name . ' as CEO.');
                }
            }
        }

        // Always redirect to role-specific dashboard (ignore intended URL)
        // All users should first land on their dashboard
        $redirectRoute = match ($role) {
            'ceo' => 'ceo.dashboard',
            'hr_manager' => 'hr-manager.dashboard',
            'admin' => 'admin.dashboard',
            default => 'dashboard', // Fallback to generic dashboard if no role
        };

        // Clear any intended URL from session - always go to dashboard first
        $request->session()->forget('url.intended');

        return redirect()->route($redirectRoute);
    }
}
