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
use App\Models\KpiEditHistory;
use App\Models\KpiTemplate;
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
        
        // Auto-create PerformanceSystem record if it doesn't exist but other performance data exists
        if (!$performanceSystem && (
            $hrProject->performanceSnapshotResponses->isNotEmpty() ||
            $hrProject->organizationalKpis->isNotEmpty() ||
            $hrProject->evaluationModelAssignments->isNotEmpty() ||
            $hrProject->evaluationStructure
        )) {
            $performanceSystem = PerformanceSystem::create([
                'hr_project_id' => $hrProject->id,
                'status' => StepStatus::IN_PROGRESS,
            ]);
            $hrProject->refresh();
        }

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

        // Load KPI review tokens for review status
        $kpiReviewTokens = \App\Models\KpiReviewToken::where('hr_project_id', $hrProject->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('organization_name')
            ->map(function ($tokens) {
                return $tokens->map(function ($token) {
                    return [
                        'id' => $token->id,
                        'token' => $token->token,
                        'email' => $token->email,
                        'name' => $token->name,
                        'organization_name' => $token->organization_name,
                        'created_at' => $token->created_at,
                        'expires_at' => $token->expires_at,
                        'uses_count' => $token->uses_count,
                        'max_uses' => $token->max_uses,
                        'is_valid' => $token->isValid(),
                        'review_link' => route('kpi-review.token', ['token' => $token->token]),
                    ];
                });
            })
            ->toArray();

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

        // Map old tab names to new ones for backward compatibility
        $tabMapping = [
            'overview' => 'overview',
            'snapshot' => 'performance-snapshot',
            'kpi-review' => 'kpi-review',
            'ceo-kpi-review' => 'ceo-kpi-review',
            'model-assignment' => 'model-assignment',
            'evaluation-structure' => 'evaluation-structure',
            'review' => 'review-submit',
            'review-submit' => 'review-submit',
        ];
        $mappedTab = $tabMapping[$tab] ?? ($tab ?: 'overview');

        // Load performance snapshot responses
        $snapshotResponses = PerformanceSnapshotResponse::where('hr_project_id', $hrProject->id)
            ->get()
            ->keyBy('question_id')
            ->map(function ($response) {
                return [
                    'response' => $response->response,
                    'text_response' => $response->text_response,
                ];
            })
            ->toArray();

        // Load organizational KPIs
        // Load KPIs and remove duplicates based on organization_name + kpi_name (case-insensitive, trimmed)
        $allKpis = OrganizationalKpi::where('hr_project_id', $hrProject->id)
            ->with('linkedJob')
            ->get();
        
        // Remove duplicates - keep the one with highest ID (most recent)
        $uniqueKpis = collect($allKpis)->unique(function ($kpi) {
            return strtolower(trim($kpi->organization_name)) . '::' . strtolower(trim($kpi->kpi_name));
        })->values();
        
        $organizationalKpis = $uniqueKpis;

        // Load evaluation model assignments
        $evaluationModelAssignments = EvaluationModelAssignment::where('hr_project_id', $hrProject->id)
            ->with('jobDefinition.jobKeyword')
            ->get();

        // Load evaluation model guidance
        $modelGuidance = [
            'mbo' => \App\Models\EvaluationModelGuidance::getActiveByModelType('mbo'),
            'bsc' => \App\Models\EvaluationModelGuidance::getActiveByModelType('bsc'),
            'okr' => \App\Models\EvaluationModelGuidance::getActiveByModelType('okr'),
        ];

        // Load job recommendations
        $jobRecommendations = [];
        foreach ($jobDefinitions as $job) {
            if ($job->job_keyword_id) {
                $recommendation = \App\Models\JobEvaluationModelRecommendation::getRecommendationForJob($job->job_keyword_id);
                if ($recommendation) {
                    $jobRecommendations[$job->job_keyword_id] = $recommendation;
                }
            }
        }

        // Use Index component which handles all tabs internally
        return Inertia::render('PerformanceSystem/Index', [
            'project' => $hrProject,
            'performanceSystem' => $performanceSystem,
            'consultantRecommendation' => $consultantRecommendation,
            'algorithmRecommendations' => $algorithmRecommendations,
            'stepStatuses' => $mainStepStatuses,
            'activeTab' => $mappedTab,
            'projectId' => $hrProject->id,
            'snapshotQuestions' => $snapshotQuestions,
            'snapshotResponses' => $snapshotResponses,
            'jobDefinitions' => $jobDefinitions,
            'organizationalKpis' => $organizationalKpis->toArray(),
            'orgChartMappings' => $orgChartMappings,
            'kpiReviewTokens' => $kpiReviewTokens,
            'evaluationModelAssignments' => $evaluationModelAssignments,
            'evaluationStructure' => $hrProject->evaluationStructure ? [
                // Flatten structure for frontend (maintain backward compatibility)
                'organizational_evaluation' => [
                    'evaluation_cycle' => $hrProject->evaluationStructure->org_evaluation_cycle,
                    'evaluation_timing' => $hrProject->evaluationStructure->org_evaluation_timing,
                    'evaluator_type' => $hrProject->evaluationStructure->org_evaluator_type,
                    'evaluation_method' => $hrProject->evaluationStructure->org_evaluation_method,
                    'rating_scale' => $hrProject->evaluationStructure->org_rating_scale,
                    'rating_distribution' => $hrProject->evaluationStructure->org_rating_distribution,
                    'evaluation_group' => $hrProject->evaluationStructure->org_evaluation_group,
                    'use_of_results' => $hrProject->evaluationStructure->org_use_of_results,
                ],
                'individual_evaluation' => [
                    'evaluation_cycle' => $hrProject->evaluationStructure->individual_evaluation_cycle,
                    'evaluation_timing' => $hrProject->evaluationStructure->individual_evaluation_timing,
                    'evaluator_types' => $hrProject->evaluationStructure->individual_evaluator_types,
                    'evaluators' => $hrProject->evaluationStructure->individual_evaluators,
                    'evaluation_method' => $hrProject->evaluationStructure->individual_evaluation_method,
                    'rating_scale' => $hrProject->evaluationStructure->individual_rating_scale,
                    'rating_distribution' => $hrProject->evaluationStructure->individual_rating_distribution,
                    'evaluation_groups' => $hrProject->evaluationStructure->individual_evaluation_groups,
                    'use_of_results' => $hrProject->evaluationStructure->individual_use_of_results,
                    'organization_leader_evaluation' => $hrProject->evaluationStructure->organization_leader_evaluation,
                ],
            ] : null,
            'modelGuidance' => [
                'mbo' => $modelGuidance['mbo'] ? [
                    'concept' => $modelGuidance['mbo']->concept,
                    'key_characteristics' => $modelGuidance['mbo']->key_characteristics,
                    'example' => $modelGuidance['mbo']->example,
                    'pros' => $modelGuidance['mbo']->pros,
                    'cons' => $modelGuidance['mbo']->cons,
                    'best_fit_organizations' => $modelGuidance['mbo']->best_fit_organizations,
                ] : null,
                'bsc' => $modelGuidance['bsc'] ? [
                    'concept' => $modelGuidance['bsc']->concept,
                    'key_characteristics' => $modelGuidance['bsc']->key_characteristics,
                    'example' => $modelGuidance['bsc']->example,
                    'pros' => $modelGuidance['bsc']->pros,
                    'cons' => $modelGuidance['bsc']->cons,
                    'best_fit_organizations' => $modelGuidance['bsc']->best_fit_organizations,
                ] : null,
                'okr' => $modelGuidance['okr'] ? [
                    'concept' => $modelGuidance['okr']->concept,
                    'key_characteristics' => $modelGuidance['okr']->key_characteristics,
                    'example' => $modelGuidance['okr']->example,
                    'pros' => $modelGuidance['okr']->pros,
                    'cons' => $modelGuidance['okr']->cons,
                    'best_fit_organizations' => $modelGuidance['okr']->best_fit_organizations,
                ] : null,
            ],
            'jobRecommendations' => $jobRecommendations,
            'evaluationStructure' => $hrProject->evaluationStructure ? [
                // Flatten structure for frontend (maintain backward compatibility)
                'organizational_evaluation' => [
                    'evaluation_cycle' => $hrProject->evaluationStructure->org_evaluation_cycle,
                    'evaluation_timing' => $hrProject->evaluationStructure->org_evaluation_timing,
                    'evaluator_type' => $hrProject->evaluationStructure->org_evaluator_type,
                    'evaluation_method' => $hrProject->evaluationStructure->org_evaluation_method,
                    'rating_scale' => $hrProject->evaluationStructure->org_rating_scale,
                    'rating_distribution' => $hrProject->evaluationStructure->org_rating_distribution,
                    'evaluation_group' => $hrProject->evaluationStructure->org_evaluation_group,
                    'use_of_results' => $hrProject->evaluationStructure->org_use_of_results,
                ],
                'individual_evaluation' => [
                    'evaluation_cycle' => $hrProject->evaluationStructure->individual_evaluation_cycle,
                    'evaluation_timing' => $hrProject->evaluationStructure->individual_evaluation_timing,
                    'evaluator_types' => $hrProject->evaluationStructure->individual_evaluator_types,
                    'evaluators' => $hrProject->evaluationStructure->individual_evaluators,
                    'evaluation_method' => $hrProject->evaluationStructure->individual_evaluation_method,
                    'rating_scale' => $hrProject->evaluationStructure->individual_rating_scale,
                    'rating_distribution' => $hrProject->evaluationStructure->individual_rating_distribution,
                    'evaluation_groups' => $hrProject->evaluationStructure->individual_evaluation_groups,
                    'use_of_results' => $hrProject->evaluationStructure->individual_use_of_results,
                    'organization_leader_evaluation' => $hrProject->evaluationStructure->organization_leader_evaluation,
                ],
            ] : null,
        ]);
    }

    /**
     * Get recommended KPI templates for the given organization (for manager KPI draft).
     * Templates are mapped by org unit (org_unit_name) and company_id; null org_unit_name = company-wide.
     */
    public function getRecommendedKpis(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }
        $organizationName = $request->query('organization_name', '');
        $companyId = $hrProject->company_id ?? null;
        $templates = KpiTemplate::where('is_active', true)
            ->where(function ($q) use ($companyId) {
                $q->whereNull('company_id')->orWhere('company_id', $companyId);
            })
            ->where(function ($q) use ($organizationName) {
                $q->whereNull('org_unit_name')
                    ->orWhereRaw('TRIM(LOWER(org_unit_name)) = ?', [strtolower(trim($organizationName))]);
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        return response()->json(['templates' => $templates->toArray()]);
    }

    /**
     * Store performance system data.
     */
    public function store(Request $request, HrProject $hrProject)
    {
        $tab = $request->input('tab', 'performance-snapshot');

        if ($tab === 'performance-snapshot' || $tab === 'snapshot') {
            return $this->storeSnapshot($request, $hrProject);
        } elseif ($tab === 'kpi-review') {
            return $this->storeKpiReview($request, $hrProject);
        } elseif ($tab === 'model-assignment') {
            return $this->storeModelAssignment($request, $hrProject);
        } elseif ($tab === 'evaluation-structure') {
            return $this->storeEvaluationStructure($request, $hrProject);
        }

        return back()->withErrors(['error' => 'Invalid tab specified.']);
    }

    /**
     * Store performance snapshot responses.
     */
    protected function storeSnapshot(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'responses' => ['required', 'array'],
            'responses.*.question_id' => ['required', 'exists:performance_snapshot_questions,id'],
            'responses.*.response' => ['required', 'array'],
            'responses.*.response.*' => ['nullable', 'string'],
            'responses.*.text_response' => ['nullable', 'string'],
        ]);

        $requiredQuestionIds = PerformanceSnapshotQuestion::where('is_active', true)->orderBy('order')->pluck('id')->values()->all();
        $submittedIds = collect($validated['responses'])->pluck('question_id')->unique()->values()->all();
        $missing = array_diff($requiredQuestionIds, $submittedIds);
        if (count($missing) > 0) {
            return back()->withErrors([
                'responses' => 'Every question must be answered. Please answer all ' . count($requiredQuestionIds) . ' questions before continuing.',
            ]);
        }

        foreach ($validated['responses'] as $r) {
            $arr = is_array($r['response']) ? $r['response'] : [$r['response']];
            $nonEmpty = array_filter(array_map('trim', $arr));
            if (count($nonEmpty) === 0) {
                return back()->withErrors([
                    'responses' => 'Every question must have at least one option selected. Please complete all questions.',
                ]);
            }
        }

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

        // Redirect to KPI Review tab
        return redirect()->route('hr-manager.performance-system.index', [$hrProject, 'kpi-review'])
            ->with('success', 'Performance snapshot saved successfully.');
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

        $newKpis = [];
        
        DB::transaction(function () use ($hrProject, $validated, $request, &$newKpis) {
            foreach ($validated['kpis'] as $kpiData) {
                if (isset($kpiData['id']) && $kpiData['id']) {
                    $kpi = OrganizationalKpi::find($kpiData['id']);
                    if ($kpi && $kpi->hr_project_id === $hrProject->id) {
                        $oldValues = $kpi->toArray();
                        $kpi->update([
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

                        // Log edit history for HR Manager
                        KpiEditHistory::create([
                            'organizational_kpi_id' => $kpi->id,
                            'edited_by_type' => 'hr_manager',
                            'edited_by_id' => $request->user()->id,
                            'edited_by_name' => $request->user()->name,
                            'changes' => [
                                'old_values' => $oldValues,
                                'new_values' => $kpi->toArray(),
                                'description' => 'HR Manager updated KPI',
                            ],
                        ]);
                    }
                } else {
                    // Check if KPI already exists for this organization and name (case-insensitive, trimmed)
                    $existingKpi = OrganizationalKpi::where('hr_project_id', $hrProject->id)
                        ->whereRaw('TRIM(LOWER(organization_name)) = ?', [trim(strtolower($kpiData['organization_name']))])
                        ->whereRaw('TRIM(LOWER(kpi_name)) = ?', [trim(strtolower($kpiData['kpi_name']))])
                        ->first();
                    
                    if ($existingKpi) {
                        // Update existing KPI instead of creating duplicate
                        $oldValues = $existingKpi->toArray();
                        $existingKpi->update([
                            'purpose' => $kpiData['purpose'] ?? $existingKpi->purpose,
                            'category' => $kpiData['category'] ?? $existingKpi->category,
                            'linked_job_id' => $kpiData['linked_job_id'] ?? $existingKpi->linked_job_id,
                            'linked_csf' => $kpiData['linked_csf'] ?? $existingKpi->linked_csf,
                            'formula' => $kpiData['formula'] ?? $existingKpi->formula,
                            'measurement_method' => $kpiData['measurement_method'] ?? $existingKpi->measurement_method,
                            'weight' => $kpiData['weight'] ?? $existingKpi->weight,
                            'is_active' => $kpiData['is_active'] ?? $existingKpi->is_active,
                            'status' => 'draft',
                        ]);

                        // Log edit history for HR Manager
                        KpiEditHistory::create([
                            'organizational_kpi_id' => $existingKpi->id,
                            'edited_by_type' => 'hr_manager',
                            'edited_by_id' => $request->user()->id,
                            'edited_by_name' => $request->user()->name,
                            'changes' => [
                                'old_values' => $oldValues,
                                'new_values' => $existingKpi->toArray(),
                                'description' => 'HR Manager updated existing KPI (duplicate prevented)',
                            ],
                        ]);
                        
                        $kpi = $existingKpi;
                    } else {
                        // Create new KPI only if it doesn't exist
                        $kpi = OrganizationalKpi::create([
                            'hr_project_id' => $hrProject->id,
                            'organization_name' => trim($kpiData['organization_name']),
                            'kpi_name' => trim($kpiData['kpi_name']),
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

                        // Log edit history for HR Manager
                        KpiEditHistory::create([
                            'organizational_kpi_id' => $kpi->id,
                            'edited_by_type' => 'hr_manager',
                            'edited_by_id' => $request->user()->id,
                            'edited_by_name' => $request->user()->name,
                            'changes' => [
                                'old_values' => null,
                                'new_values' => $kpi->toArray(),
                                'description' => 'HR Manager created new KPI',
                            ],
                        ]);
                        
                        // Track newly created KPIs for email notification
                        $newKpis[] = $kpi->toArray();
                    }
                }
            }
        });
        
        // Send email notifications to CEO and Admin when new KPIs are created
        if (!empty($newKpis)) {
            $hrProject->load('company');
            $company = $hrProject->company;
            
            // Get all CEOs for this company
            $ceos = $company->ceos()->get();
            
            // Get all admins
            $admins = \App\Models\User::role('admin')->get();
            
            // Send email to all CEOs
            foreach ($ceos as $ceo) {
                try {
                    \Mail::to($ceo->email)->send(new \App\Mail\KpiCreatedNotificationMail($hrProject, $newKpis, 'ceo'));
                } catch (\Exception $e) {
                    \Log::error('Failed to send KPI creation email to CEO', [
                        'ceo_id' => $ceo->id,
                        'ceo_email' => $ceo->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
            
            // Send email to all admins
            foreach ($admins as $admin) {
                try {
                    \Mail::to($admin->email)->send(new \App\Mail\KpiCreatedNotificationMail($hrProject, $newKpis, 'admin'));
                } catch (\Exception $e) {
                    \Log::error('Failed to send KPI creation email to Admin', [
                        'admin_id' => $admin->id,
                        'admin_email' => $admin->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        $hrProject->setStepStatus('performance', StepStatus::IN_PROGRESS);

        // Return back with success message - frontend will reload KPIs
        return back()->with('success', 'KPI saved successfully.');
    }

    /**
     * Store CEO KPI review data.
     */
    protected function storeCeoKpiReview(Request $request, HrProject $hrProject)
    {
        $action = $request->input('action');
        $validated = $request->validate([
            'kpis' => ['required', 'array'],
            'kpis.*.id' => ['required', 'exists:organizational_kpis,id'],
            'kpis.*.ceo_approval_status' => ['nullable', 'in:approved,revision_requested'],
            'kpis.*.ceo_revision_comment' => ['nullable', 'string'],
            'organization_name' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($hrProject, $validated, $action, $request) {
            foreach ($validated['kpis'] as $kpiData) {
                $kpi = OrganizationalKpi::where('id', $kpiData['id'])
                    ->where('hr_project_id', $hrProject->id)
                    ->first();
                
                if ($kpi) {
                    $oldValues = $kpi->toArray();
                    $kpi->update([
                        'ceo_approval_status' => $kpiData['ceo_approval_status'] ?? null,
                        'ceo_revision_comment' => $kpiData['ceo_revision_comment'] ?? null,
                    ]);

                    // Log edit history for CEO
                    KpiEditHistory::create([
                        'organizational_kpi_id' => $kpi->id,
                        'edited_by_type' => 'ceo',
                        'edited_by_id' => $request->user()->id,
                        'edited_by_name' => $request->user()->name,
                        'changes' => [
                            'old_values' => $oldValues,
                            'new_values' => $kpi->toArray(),
                            'description' => $action === 'request_revision' 
                                ? 'CEO requested revision: ' . ($kpiData['ceo_revision_comment'] ?? '')
                                : 'CEO approved KPI',
                        ],
                    ]);
                }
            }
        });

        $hrProject->setStepStatus('performance', StepStatus::IN_PROGRESS);

        // Return back with success message - frontend will reload data
        return back()->with('success', 'CEO KPI review saved successfully.');
    }

    /**
     * Store evaluation model assignments.
     */
    protected function storeModelAssignment(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'assignments' => ['required', 'array'],
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            // Delete existing assignments for this project
            EvaluationModelAssignment::where('hr_project_id', $hrProject->id)->delete();

            foreach ($validated['assignments'] as $jobId => $modelType) {
                EvaluationModelAssignment::create([
                    'hr_project_id' => $hrProject->id,
                    'job_definition_id' => $jobId,
                    'evaluation_model' => $modelType,
                ]);
            }
        });

        $hrProject->setStepStatus('performance', StepStatus::IN_PROGRESS);

        // Return back with success message - frontend will reload data
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
            'org_rating_scale' => ['nullable', 'in:3-level,4-level'],
            'org_rating_distribution' => ['nullable', 'array'],
            'org_evaluation_group' => ['nullable', 'in:team_level,executive_level'],
            'org_use_of_results' => ['nullable', 'array'],
            'org_use_of_results.*' => ['string', 'in:linked_to_org_manager,linked_to_individual,dist_adjust,bonus,reference,dept_head_link,other'],
            'individual_evaluation_cycle' => ['nullable', 'in:annual,semi_annual,quarterly'],
            'individual_evaluation_timing' => ['nullable', 'string'],
            'individual_evaluator_types' => ['nullable', 'array'],
            'individual_evaluators' => ['nullable', 'array'],
            'individual_evaluation_method' => ['nullable', 'in:absolute,relative'],
            'individual_rating_scale' => ['nullable', 'in:3-level,4-level,5-level'],
            'individual_rating_distribution' => ['nullable', 'array'],
            'individual_evaluation_groups' => ['nullable', 'array'],
            'individual_use_of_results' => ['nullable', 'array'],
            'individual_use_of_results_other' => ['nullable', 'string', 'max:1000'],
            'organization_leader_evaluation' => ['nullable', 'in:replaced_by_org,conducted_separately'],
        ]);

        // Store data in individual columns (matching database schema)
        $data = [
            'hr_project_id' => $hrProject->id,
            // Organizational Evaluation
            'org_evaluation_cycle' => $validated['org_evaluation_cycle'] ?? null,
            'org_evaluation_timing' => $validated['org_evaluation_timing'] ?? null,
            'org_evaluator_type' => $validated['org_evaluator_type'] ?? null,
            'org_evaluation_method' => $validated['org_evaluation_method'] ?? null,
            'org_rating_scale' => $validated['org_rating_scale'] ?? null,
            'org_rating_distribution' => $validated['org_rating_distribution'] ?? null,
            'org_evaluation_group' => $validated['org_evaluation_group'] ?? null,
            'org_use_of_results' => $validated['org_use_of_results'] ?? null,
            // Individual Evaluation
            'individual_evaluation_cycle' => $validated['individual_evaluation_cycle'] ?? null,
            'individual_evaluation_timing' => $validated['individual_evaluation_timing'] ?? null,
            'individual_evaluator_types' => $validated['individual_evaluator_types'] ?? null,
            'individual_evaluators' => $validated['individual_evaluators'] ?? null,
            'individual_evaluation_method' => $validated['individual_evaluation_method'] ?? null,
            'individual_rating_scale' => $validated['individual_rating_scale'] ?? null,
            'individual_rating_distribution' => $validated['individual_rating_distribution'] ?? null,
            'individual_evaluation_groups' => $validated['individual_evaluation_groups'] ?? null,
            'individual_use_of_results' => $validated['individual_use_of_results'] ?? null,
            'individual_use_of_results_other' => $validated['individual_use_of_results_other'] ?? null,
            'organization_leader_evaluation' => $validated['organization_leader_evaluation'] ?? null,
        ];

        EvaluationStructure::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            $data
        );

        $hrProject->setStepStatus('performance', StepStatus::IN_PROGRESS);

        // Redirect to review-submit tab after saving
        return redirect()->route('hr-manager.performance-system.index', [$hrProject, 'review-submit'])
            ->with('success', 'Evaluation structure saved successfully.');
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
