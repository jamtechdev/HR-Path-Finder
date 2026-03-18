<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Http\Requests\StoreOrganizationDesignRequest;
use App\Models\HrProject;
use App\Models\OrganizationDesign;
use App\Services\AuditLogService;
use App\Services\RecommendationService;
use App\Services\StepTransitionService;
use Illuminate\Http\Request;

class OrganizationDesignController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected StepTransitionService $stepTransitionService,
        protected RecommendationService $recommendationService
    ) {
    }

    /**
     * Show organization design step.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('job_analysis')) {
            return back()->withErrors(['error' => 'Job Analysis step is not yet unlocked.']);
        }

        $hrProject->load(['diagnosis', 'ceoPhilosophy', 'companyAttributes', 'organizationDesign']);

        // Get recommendations
        $recommendations = $this->recommendationService->getRecommendedOrganizationStructure(
            $hrProject->companyAttributes,
            $hrProject->ceoPhilosophy,
            $hrProject->organizationalSentiment,
            $hrProject->company
        );

        $stepStatuses = $hrProject->step_statuses ?? [];
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'job_analysis' => $stepStatuses['job_analysis'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
        ];

        return \Inertia\Inertia::render('OrganizationDesign/Index', [
            'project' => $hrProject,
            'organizationDesign' => $hrProject->organizationDesign,
            'recommendations' => $recommendations,
            'stepStatuses' => $mainStepStatuses,
            'projectId' => $hrProject->id,
        ]);
    }

    /**
     * Store organization design.
     */
    public function store(StoreOrganizationDesignRequest $request, HrProject $hrProject)
    {
        $data = $request->validated();

        $design = OrganizationDesign::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            array_merge($data, ['status' => StepStatus::IN_PROGRESS])
        );

        $hrProject->setStepStatus('job_analysis', StepStatus::IN_PROGRESS);

        return back()->with('success', 'Organization design saved successfully.');
    }

    /**
     * Submit organization design (persists form data then marks step submitted).
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (! $request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'structure_type' => ['required', 'string', 'max:64'],
            'job_grade_structure' => ['required', 'string', 'max:64'],
            'grade_title_relationship' => ['nullable', 'string', 'max:64'],
            'managerial_criteria' => ['nullable', 'array'],
            'managerial_criteria.*' => ['string', 'max:64'],
        ]);

        $structureMap = [
            'team-based' => 'team',
            'functional' => 'functional',
            'divisional' => 'divisional',
            'matrix' => 'matrix',
        ];
        $structureType = $structureMap[$validated['structure_type']] ?? $validated['structure_type'];

        $gradeMap = [
            'single' => 'single',
            'multi' => 'multi',
            'integrated' => 'integrated',
            'separated' => 'separated',
        ];
        $gradeStructure = $gradeMap[$validated['job_grade_structure']] ?? $validated['job_grade_structure'];

        OrganizationDesign::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            [
                'structure_type' => $structureType,
                'job_grade_structure' => $gradeStructure,
                'job_grade_details' => [
                    'grade_title_relationship' => $validated['grade_title_relationship'] ?? null,
                    'managerial_criteria' => $validated['managerial_criteria'] ?? [],
                ],
                'status' => StepStatus::IN_PROGRESS,
            ]
        );

        $this->stepTransitionService->submitStep($hrProject, 'job_analysis');

        return back()->with('success', 'Organization design submitted successfully.');
    }
}
