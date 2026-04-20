<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
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
        $path = $request->path();
        
        // Ensure session is started for CSRF token
        if (!$request->hasSession()) {
            $request->session()->start();
        }
        
        $shared = [
            ...parent::share($request),
            'name' => Setting::get('app_name', config('app.name')),
            'appConfig' => [
                'name' => Setting::get('app_name', config('app.name')),
                'logo' => ($logo = Setting::get('app_logo_path')) ? Storage::url($logo) : asset('logo.svg'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'city' => $user->city,
                    'state' => $user->state,
                    'latitude' => $user->latitude,
                    'longitude' => $user->longitude,
                    'profile_photo_url' => $user->profile_photo_path ? Storage::url($user->profile_photo_path) : null,
                    'roles' => $user->roles->map(fn($role) => ['name' => $role->name]),
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'registration_created' => $request->session()->get('registration_created'),
                'registration_message' => $request->session()->get('registration_message'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
                'message' => $request->session()->get('message'),
                'nextStep' => $request->session()->get('nextStep'),
                'nextStepRoute' => $request->session()->get('nextStepRoute'),
                'ceo_password' => $request->session()->get('ceo_password'),
                'ceo_email' => $request->session()->get('ceo_email'),
                'ceo_name' => $request->session()->get('ceo_name'),
            ],
            'notifications' => $user
                ? [
                    'unread_count' => $user->unreadNotifications()->count(),
                    'items' => $user->notifications()
                        ->latest()
                        ->get()
                        ->map(fn ($n) => [
                            'id' => $n->id,
                            'type' => class_basename($n->type),
                            'data' => $n->data,
                            'read_at' => $n->read_at?->toIso8601String(),
                            'created_at' => $n->created_at?->toIso8601String(),
                        ])
                        ->values()
                        ->all(),
                ]
                : ['unread_count' => 0, 'items' => []],
            // Translations are now loaded directly from JSON files in the frontend
        ];
        
        // Add active role to shared data (for role switching)
        if ($user) {
            $shared['activeRole'] = $request->session()->get('active_role');
            $shared['canSwitchToHr'] = $user->hasRole('hr_manager') && $request->session()->get('active_role') === 'ceo';

            if ($user->hasRole('admin')) {
                /** @var TranslationService $translationService */
                $translationService = app(TranslationService::class);
                $shared['translationPages'] = $translationService->getPages();
            }
        }
        
        // Add projects to shared data for roles that need them in sidebar (with step_statuses and kpi_review_status for KPI list menu)
        if ($user) {
            $projects = [];
            $activeRole = $request->session()->get('active_role');

            // For any /ceo/* route, always provide CEO projects for sidebar/menu consistency.
            if ($user->hasRole('ceo') && ($activeRole === 'ceo' || !$user->hasRole('hr_manager') || str_starts_with($path, 'ceo/'))) {
                $collection = \App\Models\HrProject::whereHas('company', function ($query) use ($user) {
                    $query->whereHas('users', function ($q) use ($user) {
                        $q->where('users.id', $user->id)
                          ->where('company_users.role', 'ceo');
                    });
                })->with(['company:id,name'])->get();
            } elseif ($user->hasRole('admin')) {
                $collection = \App\Models\HrProject::with(['company:id,name'])->get();
            } else {
                $collection = collect();
            }

            if ($collection->isNotEmpty()) {
                $projectIds = $collection->pluck('id')->toArray();
                // All KPIs (old and new) – count total, approved, and revision_requested for full listing
                $kpiCounts = \App\Models\OrganizationalKpi::whereIn('hr_project_id', $projectIds)
                    ->selectRaw("hr_project_id, COUNT(*) as total, SUM(CASE WHEN COALESCE(ceo_approval_status, '') = 'approved' OR COALESCE(status, '') = 'approved' THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN COALESCE(ceo_approval_status, '') = 'revision_requested' OR COALESCE(status, '') = 'revision_requested' THEN 1 ELSE 0 END) as revision_requested")
                    ->groupBy('hr_project_id')
                    ->get()
                    ->keyBy('hr_project_id');

                $projects = $collection->map(function ($project) use ($kpiCounts) {
                    $stepStatuses = $project->step_statuses ?? [];
                    $perfStatus = $stepStatuses['performance'] ?? 'not_started';
                    $counts = $kpiCounts->get($project->id);
                    $total = $counts ? (int) $counts->total : 0;
                    $approved = $counts ? (int) $counts->approved : 0;
                    $revisionRequested = $counts ? (int) $counts->revision_requested : 0;
                    $kpiReviewStatus = 'none';
                    if ($total > 0) {
                        if ($approved >= $total) {
                            $kpiReviewStatus = 'approved';
                        } elseif ($revisionRequested > 0) {
                            $kpiReviewStatus = 'revision_requested';
                        } else {
                            $kpiReviewStatus = in_array($perfStatus, ['in_progress', 'submitted']) ? 'pending' : 'in_progress';
                        }
                    }
                    return [
                        'id' => $project->id,
                        'company' => $project->company ? ['name' => $project->company->name] : null,
                        'step_statuses' => $stepStatuses,
                        'kpi_review_status' => $kpiReviewStatus,
                        'kpi_total' => $total,
                        'kpi_approved' => $approved,
                        'kpi_revision_requested' => $revisionRequested,
                    ];
                })->values()->toArray();
            }

            $shared['projects'] = $projects;
        }
        
        return $shared;
    }
}
