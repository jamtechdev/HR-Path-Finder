<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBetaAccessApproved
{
    /**
     * Block app usage until an admin sets access_granted_at (when beta mode is on).
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requiresApproval = Setting::getBool(
            'beta_require_admin_approval',
            (bool) env('BETA_REQUIRE_ADMIN_APPROVAL', false)
        );

        if (! $requiresApproval) {
            return $next($request);
        }

        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        // Admin should be able to use the system freely from the start.
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        if ($user->access_granted_at !== null) {
            return $next($request);
        }

        $name = $request->route()?->getName();

        if ($name === 'beta.pending') {
            return $next($request);
        }

        if ($name === 'logout') {
            return $next($request);
        }

        if (is_string($name) && str_starts_with($name, 'verification.')) {
            return $next($request);
        }

        if ($request->is('email/*')) {
            return $next($request);
        }

        return redirect()->route('beta.pending');
    }
}
