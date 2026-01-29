<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\OrganizationDesign;
use App\Notifications\StepSubmittedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Inertia\ResponseFactory;

class OrganizationWizardController extends Controller
{
    /**
     * Get project and company for organization step
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
            'organizationDesign',
            'ceoPhilosophy',
        ]);

        return ['company' => $company, 'project' => $project];
    }

    /**
     * Overview page - shows when clicking Organization from sidebar
     */
    public function overview(Request $request): Response|ResponseFactory|RedirectResponse
    {
        try {
            ['company' => $company, 'project' => $project] = $this->getProject($request);
            
            // Check if step is unlocked (unless admin/consultant)
            if ($project && !$project->isStepUnlocked('organization')) {
                return redirect()->route('dashboard.hr-manager')
                    ->withErrors(['step_locked' => 'Step 2 (Organization Design) is locked. Please complete and submit Step 1 (Diagnosis) first, then wait for CEO verification.']);
            }
            
            // Initialize step statuses and set to in_progress if not started
            if ($project) {
                $project->initializeStepStatuses();
                if ($project->getStepStatus('organization') === 'not_started') {
                    $project->setStepStatus('organization', 'in_progress');
                }
            }
        } catch (\Exception $e) {
            $company = null;
            $project = null;
        }

        return Inertia::render('Organization/Overview', [
            'company' => $company,
            'project' => $project,
        ]);
    }

    /**
     * Show Organization Structure step
     */
    public function showOrganizationStructure(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('organization')) {
            abort(403, 'This step is locked. Please complete and submit the previous step first.');
        }
        
        $hrProject->load(['company', 'organizationDesign', 'ceoPhilosophy']);
        
        return Inertia::render('Organization/OrganizationStructure', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Job Grade Structure step
     */
    public function showJobGradeStructure(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        $hrProject->load(['company', 'organizationDesign']);
        
        return Inertia::render('Organization/JobGradeStructure', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Grade-Title Relationship step
     */
    public function showGradeTitleRelationship(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        $hrProject->load(['company', 'organizationDesign']);
        
        return Inertia::render('Organization/GradeTitleRelationship', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Managerial Definition step
     */
    public function showManagerialDefinition(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        $hrProject->load(['company', 'organizationDesign']);
        
        return Inertia::render('Organization/ManagerialDefinition', [
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
        
        $hrProject->load(['company', 'organizationDesign']);
        
        return Inertia::render('Organization/Review', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Update Organization Structure
     */
    public function updateOrganizationStructure(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        // No validation for now - just UI
        $data = $request->only(['structure_type']);

        DB::transaction(function () use ($hrProject, $data) {
            $hrProject->organizationDesign()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                array_merge($data, [
                    'job_grade_structure' => $hrProject->organizationDesign?->job_grade_structure,
                    'grade_title_relationship' => $hrProject->organizationDesign?->grade_title_relationship,
                    'managerial_role_definition' => $hrProject->organizationDesign?->managerial_role_definition,
                ])
            );
        });

        return redirect()->route('organization.job-grade-structure', $hrProject->id);
    }

    /**
     * Update Job Grade Structure
     */
    public function updateJobGradeStructure(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $data = $request->only(['job_grade_structure']);

        DB::transaction(function () use ($hrProject, $data) {
            $hrProject->organizationDesign()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                array_merge($data, [
                    'structure_type' => $hrProject->organizationDesign?->structure_type,
                    'grade_title_relationship' => $hrProject->organizationDesign?->grade_title_relationship,
                    'managerial_role_definition' => $hrProject->organizationDesign?->managerial_role_definition,
                ])
            );
        });

        return redirect()->route('organization.grade-title-relationship', $hrProject->id);
    }

    /**
     * Update Grade-Title Relationship
     */
    public function updateGradeTitleRelationship(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $data = $request->only(['grade_title_relationship']);

        DB::transaction(function () use ($hrProject, $data) {
            $hrProject->organizationDesign()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                array_merge($data, [
                    'structure_type' => $hrProject->organizationDesign?->structure_type,
                    'job_grade_structure' => $hrProject->organizationDesign?->job_grade_structure,
                    'managerial_role_definition' => $hrProject->organizationDesign?->managerial_role_definition,
                ])
            );
        });

        return redirect()->route('organization.managerial-definition', $hrProject->id);
    }

    /**
     * Update Managerial Definition
     */
    public function updateManagerialDefinition(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $data = $request->only(['managerial_role_definition']);

        DB::transaction(function () use ($hrProject, $data) {
            $hrProject->organizationDesign()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                array_merge($data, [
                    'structure_type' => $hrProject->organizationDesign?->structure_type,
                    'job_grade_structure' => $hrProject->organizationDesign?->job_grade_structure,
                    'grade_title_relationship' => $hrProject->organizationDesign?->grade_title_relationship,
                ])
            );
        });

        return redirect()->route('organization.review', $hrProject->id);
    }

    /**
     * Submit Organization Design
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        DB::transaction(function () use ($hrProject) {
            // Set organization step status to submitted
            $hrProject->initializeStepStatuses();
            $hrProject->setStepStatus('organization', 'submitted');
            
            $hrProject->update([
                'current_step' => 'performance',
            ]);
        });

        // Send email notification to CEO only if CEO exists
        $ceo = $hrProject->getCeoUser();
        if ($ceo) {
            try {
                $ceo->notify(new StepSubmittedNotification($hrProject, 'organization'));
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
                'success' => 'Organization Design – Step 2 has been submitted successfully! An email notification has been sent to the CEO for verification. Step 3 will unlock automatically once the CEO verifies your submission.',
            ],
        ]);
    }
}
