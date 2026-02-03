<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Services\SmtpConfigurationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrManagerDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get companies where user is HR Manager
        $companies = $user->companies()
            ->wherePivot('role', 'hr_manager')
            ->with(['businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote'])
            ->get();
        
        // Get the latest/active company (most recently updated)
        $currentCompany = $companies->sortByDesc('updated_at')->first();

        // Prepare step statuses based on company status fields
        $stepStatuses = [
            'diagnosis' => $currentCompany?->diagnosis_status ?? 'not_started',
            'organization' => $currentCompany?->organization_status ?? 'not_started',
            'performance' => $currentCompany?->performance_status ?? 'not_started',
            'compensation' => $currentCompany?->compensation_status ?? 'not_started',
        ];
        
        // Count completed steps
        $progressCount = collect($stepStatuses)->filter(fn($status) => $status === 'completed')->count();
        
        // Determine current step number based on step statuses
        $stepOrder = ['diagnosis' => 1, 'organization' => 2, 'performance' => 3, 'compensation' => 4];
        $currentStepNumber = 1;
        
        foreach ($stepOrder as $step => $number) {
            if ($stepStatuses[$step] !== 'completed') {
                $currentStepNumber = $number;
                break;
            }
        }
        
        // If all steps are completed, set to last step
        if ($progressCount === 4) {
            $currentStepNumber = 4;
        }

        // Get companies by status for stats
        $inProgress = $companies->filter(fn($c) => in_array($c->overall_status, ['in_progress']));
        $completed = $companies->filter(fn($c) => $c->overall_status === 'completed');
        $notStarted = $companies->filter(fn($c) => $c->overall_status === 'not_started');

        // Check SMTP configuration
        $smtpConfigured = SmtpConfigurationService::isConfigured();

        return Inertia::render('Dashboard/HRManager/Index', [
            'companies' => $companies->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'brand_name' => $c->brand_name,
                'industry' => $c->industry,
                'diagnosis_status' => $c->diagnosis_status,
                'organization_status' => $c->organization_status,
                'performance_status' => $c->performance_status,
                'compensation_status' => $c->compensation_status,
                'overall_status' => $c->overall_status,
                'updated_at' => $c->updated_at,
            ]),
            'currentCompany' => $currentCompany ? [
                'id' => $currentCompany->id,
                'name' => $currentCompany->name,
                'diagnosis_status' => $currentCompany->diagnosis_status,
                'organization_status' => $currentCompany->organization_status,
                'performance_status' => $currentCompany->performance_status,
                'compensation_status' => $currentCompany->compensation_status,
                'overall_status' => $currentCompany->overall_status,
            ] : null,
            'project' => $currentCompany ? [
                'id' => $currentCompany->id,
                'step_statuses' => $stepStatuses,
            ] : null,
            'stepStatuses' => $stepStatuses,
            'progressCount' => $progressCount,
            'currentStepNumber' => $currentStepNumber,
            'smtpConfigured' => $smtpConfigured,
            'stats' => [
                'total_companies' => $companies->count(),
                'in_progress' => $inProgress->count(),
                'completed' => $completed->count(),
                'not_started' => $notStarted->count(),
            ]
        ]);
    }

    public function projects()
    {
        $user = auth()->user();
        $companies = $user->companies()
            ->wherePivot('role', 'hr_manager')
            ->latest()
            ->paginate(10);

        return Inertia::render('Dashboard/HRManager/Projects', [
            'companies' => $companies->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'brand_name' => $c->brand_name,
                'industry' => $c->industry,
                'diagnosis_status' => $c->diagnosis_status,
                'organization_status' => $c->organization_status,
                'performance_status' => $c->performance_status,
                'compensation_status' => $c->compensation_status,
                'overall_status' => $c->overall_status,
                'created_at' => $c->created_at,
                'updated_at' => $c->updated_at,
            ])
        ]);
    }
}