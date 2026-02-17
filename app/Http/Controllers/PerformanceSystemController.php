<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\AdminComment;
use App\Models\HrProject;
use App\Models\PerformanceSystem;
use App\Models\PerformanceSnapshotQuestion;
use App\Models\PerformanceSnapshotResponse;
use App\Models\OrganizationalKpi;
use App\Models\EvaluationModelAssignment;
use App\Models\EvaluationStructure;
use App\Models\JobDefinition;
use App\Models\OrgChartMapping;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PerformanceSystemController extends Controller
{
    public function __construct(
        protected RecommendationService $recommendationService
    ) {
    }

    /**
     * Show performance system step.
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('performance')) {
            return back()->withErrors(['error' => 'Performance System step is not yet unlocked.']);
        }

        $hrProject->load([
            'diagnosis', 
            'organizationDesign', 
            'performanceSystem', 
            'company',
            'performanceSnapshotResponses.question',
            'organizationalKpis.linkedJob',
            'evaluationModelAssignments.jobDefinition',
            'evaluationStructure',
        ]);
        $performanceSystem = $hrProject->performanceSystem;

        // Load questions for snapshot tab
        $snapshotQuestions = PerformanceSnapshotQuestion::where('is_active', true)
            ->orderBy('order')
            ->get();

        // Load job definitions for model assignment
        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->with('jobKeyword')
            ->get();

        // Load org chart mappings for KPI review
        $orgChartMappings = OrgChartMapping::where('hr_project_id', $hrProject->id)->get();

        // Load consultant recommendation
        $consultantRecommendation = AdminComment::where('hr_project_id', $hrProject->id)
            ->where('is_recommendation', true)
            ->where('recommendation_type', 'performance')
            ->first();

        // Get algorithm-based recommendations
        $algorithmRecommendations = $this->recommendationService->getRecommendedPerformanceMethod($hrProject);

        $stepStatuses = $hrProject->step_statuses ?? [];
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'job_analysis' => $stepStatuses['job_analysis'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
            'hr_policy_os' => $stepStatuses['hr_policy_os'] ?? 'not_started',
        ];

        // Use Index component which handles all tabs internally
        return Inertia::render('PerformanceSystem/Index', [
            'project' => $hrProject,
            'performanceSystem' => $performanceSystem,
            'consultantRecommendation' => $consultantRecommendation,
            'algorithmRecommendations' => $algorithmRecommendations,
            'stepStatuses' => $mainStepStatuses,
            'activeTab' => $tab,
            'projectId' => $hrProject->id,
            'snapshotQuestions' => $snapshotQuestions,
            'jobDefinitions' => $jobDefinitions,
            'orgChartMappings' => $orgChartMappings,
        ]);
    }

    /**
     * Store performance system data.
     */
    public function store(Request $request, HrProject $hrProject)
    {
        $tab = $request->input('tab', 'overview');

        if ($tab === 'snapshot') {
            return $this->storeSnapshot($request, $hrProject);
        } elseif ($tab === 'kpi-review') {
            return $this->storeKpiReview($request, $hrProject);
        } elseif ($tab === 'model-assignment') {
            return $this->storeModelAssignment($request, $hrProject);
        } elseif ($tab === 'evaluation-structure') {
            return $this->storeEvaluationStructure($request, $hrProject);
        }

        $validated = $request->validate([
            'evaluation_units' => ['nullable', 'array'],
            'performance_methods' => ['nullable', 'array'],
            'assessment_structure' => ['nullable', 'array'],
        ]);

        $performanceSystem = PerformanceSystem::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            array_merge($validated, ['status' => StepStatus::IN_PROGRESS])
        );

        $hrProject->setStepStatus('performance', StepStatus::IN_PROGRESS);

        return back()->with('success', 'Performance system data saved successfully.');
    }

    /**
     * Store performance snapshot responses.
     */
    protected function storeSnapshot(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'responses' => ['required', 'array'],
            'responses.*.question_id' => ['required', 'exists:performance_snapshot_questions,id'],
            'responses.*.response' => ['required'],
            'responses.*.text_response' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            foreach ($validated['responses'] as $responseData) {
                PerformanceSnapshotResponse::updateOrCreate(
                    [
                        'hr_project_id' => $hrProject->id,
                        'question_id' => $responseData['question_id'],
                    ],
                    [
                        'response' => is_array($responseData['response']) 
                            ? $responseData['response'] 
                            : [$responseData['response']],
                        'text_response' => $responseData['text_response'] ?? null,
                    ]
                );
            }
        });

        $hrProject->setStepStatus('performance', StepStatus::IN_PROGRESS);

        return back()->with('success', 'Performance snapshot saved successfully.');
    }

    /**
     * Store KPI review data.
     */
    protected function storeKpiReview(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'kpis' => ['required', 'array'],
            'kpis.*.organization_name' => ['required', 'string'],
            'kpis.*.kpi_name' => ['required', 'string'],
            'kpis.*.purpose' => ['nullable', 'string'],
            'kpis.*.category' => ['nullable', 'string'],
            'kpis.*.linked_job_id' => ['nullable', 'exists:job_definitions,id'],
            'kpis.*.linked_csf' => ['nullable', 'string'],
            'kpis.*.formula' => ['nullable', 'string'],
            'kpis.*.measurement_method' => ['nullable', 'string'],
            'kpis.*.weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'kpis.*.is_active' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            // Delete existing KPIs for this project
            OrganizationalKpi::where('hr_project_id', $hrProject->id)->delete();

            foreach ($validated['kpis'] as $kpiData) {
                OrganizationalKpi::create([
                    'hr_project_id' => $hrProject->id,
                    'organization_name' => $kpiData['organization_name'],
                    'kpi_name' => $kpiData['kpi_name'],
                    'purpose' => $kpiData['purpose'] ?? null,
                    'category' => $kpiData['category'] ?? null,
                    'linked_job_id' => $kpiData['linked_job_id'] ?? null,
                    'linked_csf' => $kpiData['linked_csf'] ?? null,
                    'formula' => $kpiData['formula'] ?? null,
                    'measurement_method' => $kpiData['measurement_method'] ?? null,
                    'weight' => $kpiData['weight'] ?? null,
                    'is_active' => $kpiData['is_active'] ?? true,
                    'status' => 'draft',
                ]);
            }
        });

        $hrProject->setStepStatus('performance', StepStatus::IN_PROGRESS);

        return back()->with('success', 'KPI review saved successfully.');
    }

    /**
     * Store evaluation model assignments.
     */
    protected function storeModelAssignment(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'assignments' => ['required', 'array'],
            'assignments.*.job_definition_id' => ['required', 'exists:job_definitions,id'],
            'assignments.*.evaluation_model' => ['required', 'in:mbo,bsc,okr'],
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            // Delete existing assignments for this project
            EvaluationModelAssignment::where('hr_project_id', $hrProject->id)->delete();

            foreach ($validated['assignments'] as $assignment) {
                EvaluationModelAssignment::create([
                    'hr_project_id' => $hrProject->id,
                    'job_definition_id' => $assignment['job_definition_id'],
                    'evaluation_model' => $assignment['evaluation_model'],
                ]);
            }
        });

        $hrProject->setStepStatus('performance', StepStatus::IN_PROGRESS);

        return back()->with('success', 'Evaluation model assignments saved successfully.');
    }

    /**
     * Store evaluation structure.
     */
    protected function storeEvaluationStructure(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'org_evaluation_cycle' => ['nullable', 'in:annual,semi_annual,quarterly'],
            'org_evaluation_timing' => ['nullable', 'string'],
            'org_evaluator_type' => ['nullable', 'string'],
            'org_evaluation_method' => ['nullable', 'in:absolute,relative'],
            'org_rating_scale' => ['nullable', 'in:3_level,4_level'],
            'org_rating_distribution' => ['nullable', 'array'],
            'org_evaluation_group' => ['nullable', 'string'],
            'org_use_of_results' => ['nullable', 'array'],
            'individual_evaluation_cycle' => ['nullable', 'in:annual,semi_annual,quarterly'],
            'individual_evaluation_timing' => ['nullable', 'string'],
            'individual_evaluator_types' => ['nullable', 'array'],
            'individual_evaluators' => ['nullable', 'array'],
            'individual_evaluation_method' => ['nullable', 'in:absolute,relative'],
            'individual_rating_scale' => ['nullable', 'in:3_level,4_level,5_level'],
            'individual_rating_distribution' => ['nullable', 'array'],
            'individual_evaluation_groups' => ['nullable', 'array'],
            'individual_use_of_results' => ['nullable', 'array'],
            'organization_leader_evaluation' => ['nullable', 'in:replaced_by_org,separate_individual'],
        ]);

        EvaluationStructure::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            $validated
        );

        $hrProject->setStepStatus('performance', StepStatus::IN_PROGRESS);

        return back()->with('success', 'Evaluation structure saved successfully.');
    }

    /**
     * Submit performance system.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $performanceSystem = $hrProject->performanceSystem;
        
        if (!$performanceSystem) {
            return back()->withErrors(['error' => 'Please complete the performance system first.']);
        }

        $hrProject->setStepStatus('performance', StepStatus::SUBMITTED);

        // Redirect to HR Manager dashboard after successful submission
        return redirect()->route('hr-manager.dashboard')
            ->with('success', 'Performance system submitted successfully.');
    }
}
