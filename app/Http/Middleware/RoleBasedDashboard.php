<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleBasedDashboard
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Role-wise dashboard redirects
        // Note: Consultant and Admin are the same role
        if ($user->hasRole('ceo')) {
            if ($request->route()->getName() === 'dashboard') {
                return redirect()->route('ceo.dashboard');
            }
        } elseif ($user->hasRole('hr_manager')) {
            if ($request->route()->getName() === 'dashboard') {
                return redirect()->route('hr-manager.dashboard');
            }
        } elseif ($user->hasRole('consultant') || $user->hasRole('admin')) {
            if ($request->route()->getName() === 'dashboard') {
                return redirect()->route('consultant.dashboard');
            }
        }

        return $next($request);
    }
}