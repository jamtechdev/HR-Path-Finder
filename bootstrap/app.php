<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\EnsureBetaAccessApproved::class,
        ]);
        
        $middleware->alias([
            'role.dashboard' => \App\Http\Middleware\RoleBasedDashboard::class,
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (TooManyRequestsHttpException $e, \Illuminate\Http\Request $request) {
            if (! $request->header('X-Inertia')) {
                return null;
            }
            $path = $request->path();
            if ($path !== 'login' && $path !== 'admin/login') {
                return null;
            }

            return redirect()->route($path === 'admin/login' ? 'admin.login' : 'login')->withErrors([
                'email' => 'Too many login attempts. Please wait a minute or use Forgot password to reset your password.',
            ]);
        });
    })->create();
