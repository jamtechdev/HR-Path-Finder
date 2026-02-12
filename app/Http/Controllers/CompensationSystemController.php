<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\AdminComment;
use App\Models\HrProject;
use App\Models\CompensationSystem;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompensationSystemController extends Controller
{
    public function __construct(
        protected RecommendationService $recommendationService
    ) {
    }

    /**
     * Show compensation system step.
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('compensation')) {
            return back()->withErrors(['error' => 'Compensation System step is not yet unlocked.']);
        }

        $hrProject->load(['diagnosis', 'organizationDesign', 'performanceSystem', 'compensationSystem', 'organizationalSentiment']);
        $compensationSystem = $hrProject->compensationSystem;

        // Load consultant recommendation
        $consultantRecommendation = AdminComment::where('hr_project_id', $hrProject->id)
            ->where('is_recommendation', true)
            ->where('recommendation_type', 'compensation')
            ->first();

        // Get algorithm-based recommendations
        $algorithmRecommendations = $this->recommendationService->getRecommendedCompensationStructure($hrProject);

        $stepStatuses = $hrProject->step_statuses ?? [];
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'job_analysis' => $stepStatuses['job_analysis'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
            'hr_policy_os' => $stepStatuses['hr_policy_os'] ?? 'not_started',
        ];

        // Use Index component which handles all tabs internally
        return Inertia::render('CompensationSystem/Index', [
            'project' => $hrProject,
            'compensationSystem' => $compensationSystem,
            'consultantRecommendation' => $consultantRecommendation,
            'algorithmRecommendations' => $algorithmRecommendations,
            'stepStatuses' => $mainStepStatuses,
            'activeTab' => $tab,
            'projectId' => $hrProject->id,
        ]);
    }

    /**
     * Store compensation system data.
     */
    public function store(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'compensation_structure' => ['nullable', 'array'],
            'differentiation_methods' => ['nullable', 'array'],
            'incentive_components' => ['nullable', 'array'],
        ]);

        $compensationSystem = CompensationSystem::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            array_merge($validated, ['status' => StepStatus::IN_PROGRESS])
        );

        $hrProject->setStepStatus('compensation', StepStatus::IN_PROGRESS);

        return back()->with('success', 'Compensation system data saved successfully.');
    }

    /**
     * Submit compensation system.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $compensationSystem = $hrProject->compensationSystem;
        
        if (!$compensationSystem) {
            return back()->withErrors(['error' => 'Please complete the compensation system first.']);
        }

        $hrProject->setStepStatus('compensation', StepStatus::SUBMITTED);

        return back()->with('success', 'Compensation system submitted successfully.');
    }
}
