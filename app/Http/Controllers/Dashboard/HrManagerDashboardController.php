<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
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
        $companies = $user->companies()->wherePivot('role', 'hr_manager')->get();
        
        // Get active HR projects
        $activeProjects = HrProject::whereIn('company_id', $companies->pluck('id'))
            ->whereIn('status', ['in_progress', 'pending_consultant_review', 'pending_ceo_approval'])
            ->with('company')
            ->get();

        $currentProject = HrProject::whereIn('company_id', $companies->pluck('id'))
            ->with('company')
            ->latest()
            ->first();
        
        // Initialize step statuses if project exists
        if ($currentProject) {
            $currentProject->initializeStepStatuses();
        }
            
        // Get projects by status
        $inProgress = $activeProjects->where('status', 'in_progress');
        $pendingReview = $activeProjects->where('status', 'pending_consultant_review');
        $pendingApproval = $activeProjects->where('status', 'pending_ceo_approval');

        // Prepare step statuses (default to not_started if no project)
        $stepStatuses = [
            'diagnosis' => 'not_started',
            'organization' => 'not_started',
            'performance' => 'not_started',
            'compensation' => 'not_started',
        ];
        
        $progressCount = 0;
        $currentStepNumber = 1;
        
        if ($currentProject) {
            $stepStatuses = [
                'diagnosis' => $currentProject->getStepStatus('diagnosis'),
                'organization' => $currentProject->getStepStatus('organization'),
                'performance' => $currentProject->getStepStatus('performance'),
                'compensation' => $currentProject->getStepStatus('compensation'),
            ];
            
            // Count completed steps (submitted status)
            $progressCount = collect($stepStatuses)->filter(fn($status) => $status === 'submitted')->count();
            
            // Determine current step number based on current_step or step statuses
            $stepOrder = ['diagnosis' => 1, 'organization' => 2, 'performance' => 3, 'compensation' => 4];
            $currentStep = $currentProject->current_step ?? 'diagnosis';
            $currentStepNumber = $stepOrder[$currentStep] ?? 1;
            
            // If current step is not in the 4 main steps, find the first incomplete step
            if (!isset($stepOrder[$currentStep])) {
                foreach ($stepOrder as $step => $number) {
                    if ($stepStatuses[$step] !== 'submitted') {
                        $currentStepNumber = $number;
                        break;
                    }
                }
            }
        }

        // Check SMTP configuration
        $smtpConfigured = SmtpConfigurationService::isConfigured();

        return Inertia::render('Dashboard/HRManager/Index', [
            'companies' => $companies,
            'activeProjects' => $activeProjects,
            'currentProject' => $currentProject,
            'project' => $currentProject ? [
                'id' => $currentProject->id,
                'step_statuses' => $stepStatuses,
            ] : null,
            'stepStatuses' => $stepStatuses,
            'progressCount' => $progressCount,
            'currentStepNumber' => $currentStepNumber,
            'smtpConfigured' => $smtpConfigured,
            'stats' => [
                'total_companies' => $companies->count(),
                'in_progress' => $inProgress->count(),
                'pending_review' => $pendingReview->count(),
                'pending_approval' => $pendingApproval->count(),
            ]
        ]);
    }

    public function projects()
    {
        $user = auth()->user();
        $companies = $user->companies()->wherePivot('role', 'hr_manager')->get();
        
        $projects = HrProject::whereIn('company_id', $companies->pluck('id'))
            ->with('company')
            ->latest()
            ->paginate(10);

        return Inertia::render('Dashboard/HRManager/Projects', [
            'projects' => $projects
        ]);
    }
}