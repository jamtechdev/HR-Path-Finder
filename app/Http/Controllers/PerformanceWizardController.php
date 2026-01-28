<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\PerformanceSystem;
use App\Notifications\StepSubmittedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Inertia\ResponseFactory;

class PerformanceWizardController extends Controller
{
    /**
     * Get project and company for performance step
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
            'performanceSystem',
            'organizationDesign',
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
            if ($project && !$project->isStepUnlocked('performance')) {
                return redirect()->route('dashboard.hr-manager')
                    ->withErrors(['step_locked' => 'Step 3 (Performance System) is locked. Please complete and submit Step 2 (Organization Design) first, then wait for CEO verification.']);
            }
            
            // Initialize step statuses and set to in_progress if not started
            if ($project) {
                $project->initializeStepStatuses();
                if ($project->getStepStatus('performance') === 'not_started') {
                    $project->setStepStatus('performance', 'in_progress');
                }
            }
        } catch (\Exception $e) {
            $company = null;
            $project = null;
        }

        return Inertia::render('Performance/Overview', [
            'company' => $company,
            'project' => $project,
        ]);
    }

    /**
     * Show Evaluation Unit step
     */
    public function showEvaluationUnit(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('performance')) {
            abort(403, 'This step is locked. Please complete and submit the previous step first.');
        }
        
        $hrProject->load(['company', 'performanceSystem', 'organizationDesign']);
        
        return Inertia::render('Performance/EvaluationUnit', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Performance Method step
     */
    public function showPerformanceMethod(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        $hrProject->load(['company', 'performanceSystem']);
        
        return Inertia::render('Performance/PerformanceMethod', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Evaluation Structure step
     */
    public function showEvaluationStructure(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        $hrProject->load(['company', 'performanceSystem']);
        
        return Inertia::render('Performance/EvaluationStructure', [
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
        
        $hrProject->load(['company', 'performanceSystem']);
        
        return Inertia::render('Performance/Review', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Update Evaluation Unit
     */
    public function updateEvaluationUnit(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $data = $request->only(['performance_unit']);

        DB::transaction(function () use ($hrProject, $data) {
            $hrProject->performanceSystem()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                array_merge($data, [
                    'performance_method' => $hrProject->performanceSystem?->performance_method,
                    'evaluation_structure_quantitative' => $hrProject->performanceSystem?->evaluation_structure_quantitative,
                    'evaluation_structure_relative' => $hrProject->performanceSystem?->evaluation_structure_relative,
                ])
            );
        });

        return redirect()->route('performance.performance-method', $hrProject->id);
    }

    /**
     * Update Performance Method
     */
    public function updatePerformanceMethod(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $data = $request->only(['performance_method']);

        DB::transaction(function () use ($hrProject, $data) {
            $hrProject->performanceSystem()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                array_merge($data, [
                    'performance_unit' => $hrProject->performanceSystem?->performance_unit,
                    'evaluation_structure_quantitative' => $hrProject->performanceSystem?->evaluation_structure_quantitative,
                    'evaluation_structure_relative' => $hrProject->performanceSystem?->evaluation_structure_relative,
                ])
            );
        });

        return redirect()->route('performance.evaluation-structure', $hrProject->id);
    }

    /**
     * Update Evaluation Structure
     */
    public function updateEvaluationStructure(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $data = $request->only(['evaluation_structure_quantitative', 'evaluation_structure_relative']);

        DB::transaction(function () use ($hrProject, $data) {
            $hrProject->performanceSystem()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                array_merge($data, [
                    'performance_unit' => $hrProject->performanceSystem?->performance_unit,
                    'performance_method' => $hrProject->performanceSystem?->performance_method,
                ])
            );
        });

        return redirect()->route('performance.review', $hrProject->id);
    }

    /**
     * Submit Performance System
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        DB::transaction(function () use ($hrProject) {
            // Set performance step status to submitted
            $hrProject->initializeStepStatuses();
            $hrProject->setStepStatus('performance', 'submitted');
            
            $hrProject->update([
                'current_step' => 'compensation',
            ]);
        });

        // Send email notification to CEO only if CEO exists
        $ceo = $hrProject->getCeoUser();
        if ($ceo) {
            try {
                $ceo->notify(new StepSubmittedNotification($hrProject, 'performance'));
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
                'success' => 'Performance System – Step 3 has been submitted successfully! An email notification has been sent to the CEO for verification. Step 4 will unlock automatically once the CEO verifies your submission.',
            ],
        ]);
    }
}
