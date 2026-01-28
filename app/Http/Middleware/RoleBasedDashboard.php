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
        if ($user->hasRole('ceo')) {
            if ($request->route()->getName() === 'dashboard') {
                return redirect()->route('dashboard.ceo');
            }
        } elseif ($user->hasRole('hr_manager')) {
            if ($request->route()->getName() === 'dashboard') {
                return redirect()->route('dashboard.hr-manager');
            }
        } elseif ($user->hasRole('consultant')) {
            if ($request->route()->getName() === 'dashboard') {
                return redirect()->route('dashboard.consultant');
            }
        }

        return $next($request);
    }
}