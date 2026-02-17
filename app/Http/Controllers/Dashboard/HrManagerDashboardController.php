<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HrManagerDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Ensure user is authenticated
        if (!$user) {
            return redirect()->route('login');
        }
        
        // Ensure user has hr_manager role
        if (!$user->hasRole('hr_manager')) {
            abort(403, 'You do not have permission to access this page.');
        }
        
        // Get active project for this HR manager
        $activeProject = \App\Models\HrProject::whereHas('company', function ($query) use ($user) {
            $query->whereHas('users', function ($q) use ($user) {
                $q->where('users.id', $user->id)
                  ->where('company_users.role', 'hr_manager');
            });
        })
        ->where('status', 'active')
        ->with(['company.users' => function ($query) {
            $query->wherePivot('role', 'ceo');
        }])
        ->first();

        // Calculate progress based on all 5 steps from sidebar
        $stepStatuses = $activeProject?->step_statuses ?? [];
        $completedSteps = 0;
        $currentStepNumber = 1;
        $currentStepKey = null;
        
        // All 5 steps matching sidebar: Diagnosis, Job Analysis, Performance, Compensation, HR Policy OS
        $mainSteps = [
            'diagnosis' => 'diagnosis',
            'job_analysis' => 'job_analysis',
            'performance' => 'performance',
            'compensation' => 'compensation',
            'hr_policy_os' => 'hr_policy_os'
        ];
        
        foreach ($mainSteps as $key => $step) {
            $status = $stepStatuses[$step] ?? 'not_started';
            if (in_array($status, ['submitted', 'approved', 'locked', 'completed'])) {
                $completedSteps++;
            } else {
                if ($currentStepKey === null) {
                    $currentStepKey = $step;
                    $currentStepNumber = $completedSteps + 1;
                }
            }
        }

        // Check CEO Philosophy status
        $ceoPhilosophyStatus = 'not_started';
        if ($activeProject && $activeProject->ceoPhilosophy) {
            // Check if survey is completed (has completed_at timestamp)
            if ($activeProject->ceoPhilosophy->completed_at) {
                $ceoPhilosophyStatus = 'completed';
            } elseif ($activeProject->diagnosis && $activeProject->diagnosis->status === 'submitted') {
                $ceoPhilosophyStatus = 'in_progress';
            }
        } elseif ($activeProject && $activeProject->diagnosis && $activeProject->diagnosis->status === 'submitted') {
            $ceoPhilosophyStatus = 'in_progress';
        }

        // Determine current step status
        $currentStepStatus = $currentStepKey ? ($stepStatuses[$currentStepKey] ?? 'not_started') : 'not_started';

        // Get company info for CEO invitation
        $company = $activeProject?->company;
        $hasCeo = $company ? $company->users()->wherePivot('role', 'ceo')->exists() : false;

        return Inertia::render('Dashboard/HRManager/Index', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'activeProject' => $activeProject ? [
                'id' => $activeProject->id,
                'company' => [
                    'id' => $activeProject->company->id,
                    'name' => $activeProject->company->name,
                ],
                'status' => $activeProject->status->value,
                'step_statuses' => $stepStatuses,
            ] : null,
            'company' => $company ? [
                'id' => $company->id,
                'name' => $company->name,
                'hasCeo' => $hasCeo,
            ] : null,
            'progress' => [
                'completed' => $completedSteps,
                'total' => 5, // 5 steps: Diagnosis, Job Analysis, Performance, Compensation, HR Policy OS
                'currentStepNumber' => $currentStepNumber,
                'currentStepKey' => $currentStepKey,
                'currentStepStatus' => $currentStepStatus,
            ],
            'ceoPhilosophyStatus' => $ceoPhilosophyStatus,
            'stepStatuses' => $stepStatuses,
            'projectId' => $activeProject?->id,
        ]);
    }
}
