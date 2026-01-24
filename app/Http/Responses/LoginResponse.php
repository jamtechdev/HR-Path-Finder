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
        
        // Get user's primary role
        $role = $user->roles->first()?->name;

        // Redirect based on role (all roles go to dashboard for now)
        // You can customize this to redirect to role-specific dashboards
        $redirectPath = match ($role) {
            'ceo' => '/dashboard',
            'hr_manager' => '/dashboard',
            'consultant' => '/dashboard',
            default => '/dashboard',
        };

        return redirect()->intended($redirectPath);
    }
}
