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
