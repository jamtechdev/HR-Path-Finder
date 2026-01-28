<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrManagerDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $companies = $user->companies()->wherePivot('role', 'hr_manager')->get();
        
        $latestProject = null;
        if ($companies->isNotEmpty()) {
            $latestProject = HrProject::whereIn('company_id', $companies->pluck('id'))
                ->with('company')
                ->latest()
                ->first();
            
            if ($latestProject) {
                $latestProject->initializeStepStatuses();
            }
        }

        // Calculate step statuses and progress
        $stepStatuses = [
            'diagnosis' => $latestProject ? $latestProject->getStepStatus('diagnosis') : 'not_started',
            'organization' => $latestProject ? $latestProject->getStepStatus('organization') : 'not_started',
            'performance' => $latestProject ? $latestProject->getStepStatus('performance') : 'not_started',
            'compensation' => $latestProject ? $latestProject->getStepStatus('compensation') : 'not_started',
        ];

        // Calculate progress count (submitted steps)
        $progressCount = collect($stepStatuses)->filter(fn($status) => $status === 'submitted')->count();

        // Determine current step number
        $currentStepNumber = 1;
        if ($latestProject) {
            $stepOrder = ['diagnosis' => 1, 'organization' => 2, 'performance' => 3, 'compensation' => 4];
            $currentStep = $latestProject->current_step ?? 'diagnosis';
            $currentStepNumber = $stepOrder[$currentStep] ?? 1;
        }

        return Inertia::render('Dashboard/HRManager/Index', [
            'project' => $latestProject,
            'stepStatuses' => $stepStatuses,
            'progressCount' => $progressCount,
            'currentStepNumber' => $currentStepNumber,
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