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

        // Check if login came from admin login page
        $isAdminLogin = $request->has('_admin_login') || 
                       $request->input('_admin_login') === true ||
                       $request->input('_admin_login') === '1' ||
                       $request->input('_admin_login') === 'true' ||
                       ($request->header('referer') && str_contains($request->header('referer'), '/admin/login'));
        
        // If coming from admin login, verify user is admin
        if ($isAdminLogin && $role !== 'admin') {
            auth()->logout();
            return redirect()->route('admin.login')
                ->withErrors(['email' => 'You do not have administrator privileges.']);
        }
        
        // If admin login successful, ensure redirect to admin dashboard
        if ($isAdminLogin && $role === 'admin') {
            return redirect()->route('admin.dashboard')
                ->with('success', 'Welcome to the admin dashboard!');
        }

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
                
                // If there's a project, check what CEO needs to do
                if ($hrProject) {
                    $hrProject->initializeStepStatuses();
                    $ceoPhilosophy = $hrProject->ceoPhilosophy;
                    $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
                    
                    // If diagnosis is submitted but CEO hasn't completed survey, redirect to survey
                    if ($diagnosisStatus && $diagnosisStatus->value === 'submitted' && (!$ceoPhilosophy || !$ceoPhilosophy->completed_at)) {
                        return redirect()->route('ceo.philosophy.survey', $hrProject->id)
                            ->with('success', 'Welcome! Please complete the Management Philosophy Survey to verify Step 1: Diagnosis.');
                    }
                    
                    // If survey completed OR diagnosis not yet submitted, redirect to CEO dashboard
                    // CEO dashboard will show them what they need to do
                    return redirect()->route('ceo.dashboard')
                        ->with('success', 'Welcome! You can review and manage the HR project for ' . $company->name . '.');
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
