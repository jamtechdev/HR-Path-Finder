<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\CompensationSystem;
use App\Notifications\StepSubmittedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Inertia\ResponseFactory;

class CompensationWizardController extends Controller
{
    /**
     * Get project and company for compensation step
     */
    private function getProject(Request $request, ?int $projectId = null): array
    {
        $user = Auth::user();
        $companyId = $request->query('company_id');

        $companiesQuery = $user->companies()->with('hrProjects');
        if ($companyId) {
            $companiesQuery->where('companies.id', $companyId);
        }

        $company = $companiesQuery->first();

        if (! $company) {
            return ['company' => null, 'project' => null];
        }

        $this->authorize('view', $company);

        $project = $projectId 
            ? $company->hrProjects()->findOrFail($projectId)
            : $company->hrProjects()->latest()->first();

        if (! $project) {
            abort(404, 'Project not found');
        }

        $project->load([
            'company',
            'compensationSystem',
            'performanceSystem',
        ]);

        return ['company' => $company, 'project' => $project];
    }

    /**
     * Overview page
     */
    public function overview(Request $request): Response|ResponseFactory
    {
        try {
            ['company' => $company, 'project' => $project] = $this->getProject($request);
            
            // Check if step is unlocked (unless admin/consultant)
            if ($project && !$project->isStepUnlocked('compensation')) {
                return redirect()->route('dashboard.hr-manager')
                    ->withErrors(['step_locked' => 'Step 4 (Compensation System) is locked. Please complete and submit Step 3 (Performance System) first, then wait for CEO verification.']);
            }
            
            // Initialize step statuses and set to in_progress if not started
            if ($project) {
                $project->initializeStepStatuses();
                if ($project->getStepStatus('compensation') === 'not_started') {
                    $project->setStepStatus('compensation', 'in_progress');
                }
            }
        } catch (\Exception $e) {
            $company = null;
            $project = null;
        }

        return Inertia::render('Compensation/Overview', [
            'company' => $company,
            'project' => $project,
        ]);
    }

    /**
     * Show Compensation Structure step
     */
    public function showCompensationStructure(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('compensation')) {
            abort(403, 'This step is locked. Please complete and submit the previous step first.');
        }
        
        $hrProject->load(['company', 'compensationSystem', 'performanceSystem']);
        
        return Inertia::render('Compensation/CompensationStructure', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Differentiation Method step
     */
    public function showDifferentiationMethod(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        $hrProject->load(['company', 'compensationSystem']);
        
        return Inertia::render('Compensation/DifferentiationMethod', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Incentive Components step
     */
    public function showIncentiveComponents(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        $hrProject->load(['company', 'compensationSystem']);
        
        return Inertia::render('Compensation/IncentiveComponents', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Review step
     */
    public function showReview(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        $hrProject->load(['company', 'compensationSystem']);
        
        return Inertia::render('Compensation/Review', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Update Compensation Structure
     */
    public function updateCompensationStructure(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $data = $request->only(['compensation_structure']);

        DB::transaction(function () use ($hrProject, $data) {
            $hrProject->compensationSystem()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                array_merge($data, [
                    'differentiation_method' => $hrProject->compensationSystem?->differentiation_method,
                    'incentive_components' => $hrProject->compensationSystem?->incentive_components,
                ])
            );
        });

        return redirect()->route('compensation.differentiation-method', $hrProject->id);
    }

    /**
     * Update Differentiation Method
     */
    public function updateDifferentiationMethod(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $data = $request->only(['differentiation_method']);

        DB::transaction(function () use ($hrProject, $data) {
            $hrProject->compensationSystem()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                array_merge($data, [
                    'compensation_structure' => $hrProject->compensationSystem?->compensation_structure,
                    'incentive_components' => $hrProject->compensationSystem?->incentive_components,
                ])
            );
        });

        return redirect()->route('compensation.incentive-components', $hrProject->id);
    }

    /**
     * Update Incentive Components
     */
    public function updateIncentiveComponents(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $incentiveComponents = $request->input('incentive_components', []);
        if (!is_array($incentiveComponents)) {
            $incentiveComponents = [];
        }

        DB::transaction(function () use ($hrProject, $incentiveComponents) {
            $hrProject->compensationSystem()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                [
                    'incentive_components' => $incentiveComponents,
                    'compensation_structure' => $hrProject->compensationSystem?->compensation_structure,
                    'differentiation_method' => $hrProject->compensationSystem?->differentiation_method,
                ]
            );
        });

        return redirect()->route('compensation.review', $hrProject->id);
    }

    /**
     * Submit Compensation System
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        DB::transaction(function () use ($hrProject) {
            // Set compensation step status to submitted
            $hrProject->initializeStepStatuses();
            $hrProject->setStepStatus('compensation', 'submitted');
            
            $hrProject->update([
                'current_step' => 'complete',
                'status' => 'submitted',
            ]);
        });

        // Send email notification to CEO only if CEO exists
        $ceo = $hrProject->getCeoUser();
        if ($ceo) {
            try {
                $ceo->notify(new StepSubmittedNotification($hrProject, 'compensation'));
            } catch (\Exception $e) {
                \Log::error('Failed to send CEO notification: ' . $e->getMessage());
            }
        }

        // Reload project data
        $hrProject->refresh();
        $hrProject->load('company');
        $hrProject->initializeStepStatuses();
        
        // Calculate step statuses and progress
        $stepStatuses = [
            'diagnosis' => $hrProject->getStepStatus('diagnosis'),
            'organization' => $hrProject->getStepStatus('organization'),
            'performance' => $hrProject->getStepStatus('performance'),
            'compensation' => $hrProject->getStepStatus('compensation'),
        ];

        $progressCount = collect($stepStatuses)->filter(fn($status) => $status === 'submitted')->count();
        $stepOrder = ['diagnosis' => 1, 'organization' => 2, 'performance' => 3, 'compensation' => 4];
        $currentStep = $hrProject->current_step ?? 'diagnosis';
        $currentStepNumber = $stepOrder[$currentStep] ?? 1;

        // Render dashboard without page refresh
        return Inertia::render('Dashboard/HRManager/Index', [
            'project' => $hrProject,
            'stepStatuses' => $stepStatuses,
            'progressCount' => $progressCount,
            'currentStepNumber' => $currentStepNumber,
            'flash' => [
                'success' => 'Compensation System – Step 4 has been submitted successfully! An email notification has been sent to the CEO for verification.',
            ],
        ]);
    }
}
