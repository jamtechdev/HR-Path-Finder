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
        // Check if user has switched role (HR switched to CEO)
        $activeRole = $request->session()->get('active_role');
        
        if ($activeRole === 'ceo' && $user->hasRole('ceo')) {
            // User switched from HR to CEO, show CEO dashboard
            if ($request->route()->getName() === 'dashboard') {
                return redirect()->route('ceo.dashboard');
            }
        } elseif ($user->hasRole('ceo') && !$user->hasRole('hr_manager')) {
            // Pure CEO (not HR), show CEO dashboard
            if ($request->route()->getName() === 'dashboard') {
                return redirect()->route('ceo.dashboard');
            }
        } elseif ($user->hasRole('hr_manager') && $activeRole !== 'ceo') {
            // HR Manager (not switched), show HR dashboard
            if ($request->route()->getName() === 'dashboard') {
                return redirect()->route('hr-manager.dashboard');
            }
        } elseif ($user->hasRole('admin')) {
            if ($request->route()->getName() === 'dashboard') {
                return redirect()->route('admin.dashboard');
            }
        }

        return $next($request);
    }
}