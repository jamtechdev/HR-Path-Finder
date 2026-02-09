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
     * Submit organization design.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $design = $hrProject->organizationDesign;
        
        if (!$design) {
            return back()->withErrors(['error' => 'Please complete the organization design first.']);
        }

        $this->stepTransitionService->submitStep($hrProject, 'job_analysis');

        return back()->with('success', 'Organization design submitted successfully.');
    }
}
