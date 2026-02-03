<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

class RegisteredUserResponse implements RegisterResponseContract
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
        
        // Clear permission cache to ensure fresh roles
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        
        // Refresh user from database to get latest data
        $user->refresh();
        
        // Reload user with roles relationship
        $user->load('roles');
        
        // Get user's primary role - try multiple methods to ensure we get it
        $role = null;
        
        // Method 1: Get from roles collection
        if ($user->roles && $user->roles->isNotEmpty()) {
            $role = $user->roles->first()->name;
        }
        
        // Method 2: Check using hasRole method if roles collection is empty
        if (!$role) {
            if ($user->hasRole('ceo')) {
                $role = 'ceo';
            } elseif ($user->hasRole('hr_manager')) {
                $role = 'hr_manager';
            } elseif ($user->hasRole('consultant')) {
                $role = 'consultant';
            }
        }
        
        // Method 3: Direct database query as last resort
        if (!$role) {
            $roleRecord = \Spatie\Permission\Models\Role::whereHas('users', function($query) use ($user) {
                $query->where('users.id', $user->id);
            })->first();
            
            if ($roleRecord) {
                $role = $roleRecord->name;
            }
        }

        // If no role assigned, redirect to generic dashboard (shouldn't happen but safety check)
        if (!$role) {
            \Log::warning('User registered without role', ['user_id' => $user->id, 'email' => $user->email]);
            return redirect()->route('dashboard');
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
                }
                
                // CEO just joined a company, redirect them to review company info
                return redirect()->route('companies.show', $company->id)
                    ->with('success', 'Welcome! You have successfully joined ' . $company->name . ' as CEO.');
            }
        }

        // Redirect based on role to role-specific dashboards
        // For new registrations, always go to dashboard (no intended URL)
        $redirectRoute = match ($role) {
            'ceo' => 'dashboard.ceo',
            'hr_manager' => 'dashboard.hr-manager',
            'consultant' => 'dashboard.consultant',
            default => 'dashboard', // Fallback to generic dashboard if no role
        };

        return redirect()->route($redirectRoute);
    }
}
