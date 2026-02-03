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
                
                // If there's a project and CEO hasn't completed philosophy survey, redirect to philosophy survey
                if ($hrProject) {
                    $hrProject->initializeStepStatuses();
                    $ceoPhilosophy = $hrProject->ceoPhilosophy;
                    
                    // If philosophy not completed, redirect to philosophy survey for onboarding
                    if (!$ceoPhilosophy || !$ceoPhilosophy->completed_at) {
                        return redirect()->route('hr-projects.ceo-philosophy.show', $hrProject->id)
                            ->with('success', 'Welcome! Please complete the Management Philosophy Survey to continue.');
                    }
                } else {
                    // No project yet, but CEO is attached - show company page
                    return redirect()->route('companies.show', $company->id)
                        ->with('success', 'Welcome! You have successfully joined ' . $company->name . ' as CEO.');
                }
            }
        }

        // Redirect based on role to role-specific dashboards
        $redirectRoute = match ($role) {
            'ceo' => 'dashboard.ceo',
            'hr_manager' => 'dashboard.hr-manager',
            'consultant' => 'dashboard.consultant',
            default => 'dashboard', // Fallback to generic dashboard if no role
        };

        return redirect()->intended(route($redirectRoute));
    }
}
