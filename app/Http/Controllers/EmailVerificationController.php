<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\SmtpConfigurationService;

class EmailVerificationController extends Controller
{
    /**
     * Manually verify email when SMTP is not configured (development only).
     */
    public function manualVerify(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login')
                ->withErrors(['error' => 'You must be logged in to verify your email.']);
        }
        
        // Only allow manual verification if SMTP is not configured (development mode)
        if (SmtpConfigurationService::isConfigured()) {
            return redirect()->route('verification.notice')
                ->withErrors(['error' => 'SMTP is configured. Please use the email verification link instead.']);
        }
        
        // Only allow in development/local environment
        if (app()->environment('production')) {
            return redirect()->route('verification.notice')
                ->withErrors(['error' => 'Manual verification is not allowed in production.']);
        }
        
        // Verify the user's email
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            
            // Reload user with roles to ensure they're loaded
            $user->refresh();
            $user->load('roles');
            
            // Get user's primary role
            $role = $user->roles->first()?->name;
            
            // Always redirect HR Manager to dashboard after email verification
            // Status will remain "not_started" until they click "Start" from overview page
            if ($role === 'hr_manager') {
                return redirect()->route('dashboard.hr-manager')
                    ->with('success', 'Your email has been verified successfully!');
            }
            
            // Check if CEO just joined via invitation - redirect to company page for onboarding
            if ($role === 'ceo') {
                $user->load('companies');
                $company = $user->companies()->wherePivot('role', 'ceo')->latest('company_users.created_at')->first();
                
                if ($company) {
                    $hrProject = $company->hrProjects()->latest()->first();
                    
                    // If there's a project and CEO hasn't completed philosophy survey, redirect to philosophy survey
                    if ($hrProject) {
                        $hrProject->initializeStepStatuses();
                        $ceoPhilosophy = $hrProject->ceoPhilosophy;
                        
                        // If philosophy not completed, redirect to philosophy survey for onboarding
                        if (!$ceoPhilosophy || !$ceoPhilosophy->completed_at) {
                            return redirect()->route('ceo.hr-projects.ceo-philosophy.show', $hrProject->id)
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
                'ceo' => 'ceo.dashboard',
                'hr_manager' => 'hr-manager.dashboard',
                'consultant' => 'consultant.dashboard',
                default => 'dashboard',
            };
            
            return redirect()->route($redirectRoute)
                ->with('success', 'Your email has been verified successfully!');
        }
        
        // Already verified - use same redirect logic
        $user->refresh();
        $user->load('roles');
        $role = $user->roles->first()?->name;
        
        $redirectRoute = match ($role) {
            'ceo' => 'dashboard.ceo',
            'hr_manager' => 'dashboard.hr-manager',
            'consultant' => 'dashboard.consultant',
            default => 'dashboard',
        };
        
        return redirect()->route($redirectRoute)
            ->with('info', 'Your email is already verified.');
    }
}
