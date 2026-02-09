<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        // Ensure session is started for CSRF token
        if (!$request->hasSession()) {
            $request->session()->start();
        }
        
        $shared = [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                    'roles' => $user->roles->map(fn($role) => ['name' => $role->name]),
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'message' => $request->session()->get('message'),
                'nextStep' => $request->session()->get('nextStep'),
                'nextStepRoute' => $request->session()->get('nextStepRoute'),
            ],
        ];
        
        // Add projects to shared data for roles that need them in sidebar
        if ($user) {
            $projects = [];
            
            if ($user->hasRole('ceo')) {
                $projects = \App\Models\HrProject::whereHas('company', function ($query) use ($user) {
                    $query->whereHas('users', function ($q) use ($user) {
                        $q->where('users.id', $user->id)
                          ->where('company_users.role', 'ceo');
                    });
                })->with(['company:id,name'])->select('id', 'company_id')->get()->map(function ($project) {
                    return [
                        'id' => $project->id,
                        'company' => $project->company ? ['name' => $project->company->name] : null,
                    ];
                })->toArray();
            } elseif ($user->hasRole('admin')) {
                $projects = \App\Models\HrProject::with(['company:id,name'])->select('id', 'company_id')->get()->map(function ($project) {
                    return [
                        'id' => $project->id,
                        'company' => $project->company ? ['name' => $project->company->name] : null,
                    ];
                })->toArray();
            }
            
            $shared['projects'] = $projects;
        }
        
        return $shared;
    }
}
