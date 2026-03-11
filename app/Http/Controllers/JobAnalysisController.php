<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\JobAnalysisIntro;
use App\Models\PolicySnapshotQuestion;
use App\Models\PolicySnapshotAnswer;
use App\Models\JobKeyword;
use App\Models\JobDefinition;
use App\Models\JobDefinitionTemplate;
use App\Models\OrgChartMapping;
use App\Enums\StepStatus;
use App\Services\StepTransitionService;
use App\Services\WorkflowStateService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobAnalysisController extends Controller
{
    public function __construct(
        protected StepTransitionService $stepTransitionService,
        protected WorkflowStateService $workflowStateService
    ) {
    }

    /**
     * Determine company size range from workforce count.
     */
    private function determineSizeRange(int $workforce): string
    {
        if ($workforce <= 50) {
            return '1-50';
        } elseif ($workforce <= 200) {
            return '51-200';
        } elseif ($workforce <= 500) {
            return '201-500';
        } else {
            return '500+';
        }
    }

    /**
     * Enrich suggested jobs with job_family and tags for Job List Selection UI.
     */
    private function enrichSuggestedJobsForListSelection(array $jobs, bool $hasFormalFramework): array
    {
        $familyByNames = [
            'Corporate & Management Support' => ['HR', 'Accounting', 'Finance', 'General Affairs', 'Treasury', 'Business Planning'],
            'Clinical & Medical' => ['Clinical Operations', 'Medical Affairs', 'Regulatory Affairs', 'Quality Assurance', 'Quality'],
            'Operations & Technology' => ['IT', 'CS', 'Procurement', 'Logistics'],
        ];
        $nameToFamily = [];
        foreach ($familyByNames as $family => $names) {
            foreach ($names as $name) {
                $nameToFamily[$name] = $family;
            }
        }

        $enriched = [];
        $order = 0;
        foreach ($jobs as $job) {
            $name = $job['name'] ?? '';
            $tags = [];
            if ($order < 6) {
                $tags[] = 'core';
            }
            if (!$hasFormalFramework && $order < 2) {
                $tags[] = 'pre_selected';
            } elseif ($order >= 6 && $order < 9) {
                $tags[] = 'recommended';
            }
            $enriched[] = array_merge($job, [
                'job_family' => $nameToFamily[$name] ?? 'Other',
                'tags' => array_values(array_unique($tags)),
            ]);
            $order++;
        }
        return $enriched;
    }

    /**
     * Show Job Analysis index with tabs.
     * Loads all necessary data for the current step without saving anything.
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('job_analysis')) {
            return redirect()->route('hr-manager.dashboard')
                ->withErrors(['error' => 'Job Analysis step is not yet unlocked.']);
        }

        // Default to overview if no tab or overview is requested
        if (empty($tab) || $tab === 'overview') {
            $tab = 'overview';
        }

        $diagnosis = $hrProject->diagnosis;
        $industry = $diagnosis->industry_category ?? null;
        $workforce = $diagnosis->present_headcount ?? 0;
        $sizeRange = $this->determineSizeRange($workforce);

        // Load intro text (use JobAnalysisIntro model)
        $introText = JobAnalysisIntro::getActiveByKey('hr_job_analysis_intro');

        // Load policy snapshot questions
        $questions = PolicySnapshotQuestion::where('is_active', true)
            ->orderBy('order')
            ->get();

        // Load saved answers (if any exist from previous sessions)
        $savedAnswers = PolicySnapshotAnswer::where('hr_project_id', $hrProject->id)
            ->get()
            ->keyBy('question_id')
            ->map(function($answer) {
                return [
                    'answer' => $answer->answer,
                    'conditional_text' => $answer->conditional_text,
                ];
            })
            ->toArray();

        // Load suggested job keywords based on industry × size
        $suggestedJobs = JobKeyword::where(function($query) use ($industry, $sizeRange) {
            $query->whereNull('industry_category')
                  ->orWhere('industry_category', $industry);
        })
        ->where(function($query) use ($sizeRange) {
            $query->whereNull('company_size_range')
                  ->orWhere('company_size_range', $sizeRange);
        })
        ->where('is_active', true)
        ->orderBy('order')
        ->get();

        // Load job definition templates for industry × size × job combinations
        $templates = JobDefinitionTemplate::where(function($query) use ($industry, $sizeRange) {
            $query->whereNull('industry_category')
                  ->orWhere('industry_category', $industry);
        })
        ->where(function($query) use ($sizeRange) {
            $query->whereNull('company_size_range')
                  ->orWhere('company_size_range', $sizeRange);
        })
        ->where('is_active', true)
        ->get()
        ->keyBy(function($template) {
            return $template->job_keyword_id ?? 'custom';
        })
        ->map(function($template) {
            return [
                'job_description' => $template->job_description,
                'job_specification' => $template->job_specification,
                'competency_levels' => $template->competency_levels,
                'csfs' => $template->csfs,
            ];
        })
        ->toArray();

        // Load existing job definitions (for display only, not for editing until finalization)
        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', false)
            ->with('jobKeyword')
            ->get();

        $finalizedJobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->with('jobKeyword')
            ->get();

        // Load org chart mappings
        $mappings = OrgChartMapping::where('hr_project_id', $hrProject->id)->get();

        // Load organizational charts from diagnosis
        $organizationalCharts = $diagnosis->organizational_charts ?? [];

        // Check step status
        $stepStatuses = $hrProject->step_statuses ?? [];
        $jobAnalysisStatus = $stepStatuses['job_analysis'] ?? 'not_started';
        $introCompleted = in_array($jobAnalysisStatus, ['in_progress', 'submitted', 'approved', 'locked']);

        // Map old tab names to new step names (before-you-begin removed; redirect to overview)
        if ($tab === 'before-you-begin' || $tab === 'intro') {
            return redirect()->route('hr-manager.job-analysis.index', [$hrProject, 'overview']);
        }
        $stepMap = [
            'overview' => 'overview',
            'policy-snapshot' => 'policy-snapshot',
            'job-list-selection' => 'job-list-selection',
            'job-definition' => 'job-definition',
            'finalization' => 'finalization',
            'org-chart-mapping' => 'org-chart-mapping',
            'review' => 'review-submit',
        ];
        $activeStep = $stepMap[$tab] ?? $tab ?? 'overview';

        // Diagnosis context for Job List Selection (Step 2): Industry, Company Size, Job Classification Status from Step 1
        $formalFrameworkQuestion = $questions->firstWhere('order', 1);
        $jobClassificationStatus = null;
        if ($formalFrameworkQuestion && isset($savedAnswers[$formalFrameworkQuestion->id])) {
            $jobClassificationStatus = $savedAnswers[$formalFrameworkQuestion->id]['answer'] ?? null;
        }
        $diagnosisContext = [
            'industry' => $industry,
            'sizeRange' => $sizeRange,
            'jobClassificationStatus' => $jobClassificationStatus, // yes | no | not_sure
            'hasFormalFramework' => $jobClassificationStatus === 'yes',
        ];

        // Enrich suggested jobs with job_family and tags for Job List Selection UI
        $hasFormalFramework = $jobClassificationStatus === 'yes';
        $suggestedJobsEnriched = $this->enrichSuggestedJobsForListSelection(
            $suggestedJobs->toArray(),
            $hasFormalFramework
        );

        return Inertia::render('JobAnalysis/Index', [
            'project' => $hrProject,
            'activeTab' => $activeStep,
            'introText' => $introText,
            'questions' => $questions,
            'policySnapshotAnswers' => $savedAnswers,
            'suggestedJobs' => $suggestedJobsEnriched,
            'jobDefinitions' => $jobDefinitions,
            'finalizedJobDefinitions' => $finalizedJobDefinitions,
            'mappings' => $mappings,
            'organizationalCharts' => $organizationalCharts,
            'industry' => $industry,
            'sizeRange' => $sizeRange,
            'diagnosisContext' => $diagnosisContext,
            'introCompleted' => $introCompleted,
            'stepStatuses' => $stepStatuses,
            'templates' => $templates,
        ]);
    }

    /**
     * Store intro completion (mark step as in progress).
     * No data saving, just marking progress.
     */
    public function storeIntro(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Mark job analysis as in progress
        $hrProject->setStepStatus('job_analysis', StepStatus::IN_PROGRESS);

        return back()->with('success', 'Intro completed.');
    }

    /**
     * Save policy snapshot answers to database (incremental save).
     */
    public function storePolicySnapshot(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'policy_answers' => ['nullable', 'array'],
            'policy_answers.*.question_id' => ['required', 'exists:policy_snapshot_questions,id'],
            'policy_answers.*.answer' => ['required', 'string', 'in:yes,no,not_sure'],
            'policy_answers.*.conditional_text' => ['nullable', 'string'],
        ]);

        if (!empty($validated['policy_answers'])) {
            foreach ($validated['policy_answers'] as $answerData) {
                PolicySnapshotAnswer::updateOrCreate(
                    [
                        'hr_project_id' => $hrProject->id,
                        'question_id' => $answerData['question_id'],
                    ],
                    [
                        'answer' => $answerData['answer'],
                        'conditional_text' => $answerData['conditional_text'] ?? null,
                    ]
                );
            }
        }

        return redirect()->route('hr-manager.job-analysis.index', [$hrProject, 'job-list-selection']);
    }

    /**
     * Save job list selection to database (creates non-finalized job definitions).
     */
    public function storeJobListSelection(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'job_selections' => ['required', 'array'],
            'job_selections.selected_job_keyword_ids' => ['nullable', 'array'],
            'job_selections.selected_job_keyword_ids.*' => ['exists:job_keywords,id'],
            'job_selections.custom_jobs' => ['nullable', 'array'],
            'job_selections.custom_jobs.*' => ['required', 'string', 'max:255'],
            'job_selections.grouped_jobs' => ['nullable', 'array'],
            'job_selections.grouped_jobs.*.name' => ['required', 'string'],
            'job_selections.grouped_jobs.*.job_keyword_ids' => ['required', 'array'],
            'job_selections.grouped_jobs.*.job_keyword_ids.*' => ['exists:job_keywords,id'],
        ]);

        $hasSelectedJobs = !empty($validated['job_selections']['selected_job_keyword_ids']) && count($validated['job_selections']['selected_job_keyword_ids']) > 0;
        $hasCustomJobs = !empty($validated['job_selections']['custom_jobs']) && count($validated['job_selections']['custom_jobs']) > 0;
        $hasGroupedJobs = !empty($validated['job_selections']['grouped_jobs']) && count($validated['job_selections']['grouped_jobs']) > 0;
        if (!$hasSelectedJobs && !$hasCustomJobs && !$hasGroupedJobs) {
            return back()->withErrors(['job_selections' => 'Please select at least one job, add a custom job, or create a grouped job.']);
        }

        $diagnosis = $hrProject->diagnosis;
        $workforce = $diagnosis->present_headcount ?? 0;
        $sizeRange = $this->determineSizeRange($workforce);

        JobDefinition::where('hr_project_id', $hrProject->id)->where('is_finalized', false)->delete();

        $customJobKeywordIds = [];
        if (!empty($validated['job_selections']['custom_jobs'])) {
            foreach ($validated['job_selections']['custom_jobs'] as $customJobName) {
                $customJobKeyword = JobKeyword::create([
                    'name' => $customJobName,
                    'industry_category' => $diagnosis->industry_category ?? null,
                    'company_size_range' => $sizeRange,
                    'order' => JobKeyword::max('order') + 1,
                    'is_active' => true,
                ]);
                $customJobKeywordIds[] = $customJobKeyword->id;
            }
        }

        $allJobKeywordIds = array_merge(
            $validated['job_selections']['selected_job_keyword_ids'] ?? [],
            $customJobKeywordIds
        );

        foreach ($allJobKeywordIds as $jobKeywordId) {
            $isInGroup = false;
            if (!empty($validated['job_selections']['grouped_jobs'])) {
                foreach ($validated['job_selections']['grouped_jobs'] as $groupedJob) {
                    if (in_array($jobKeywordId, $groupedJob['job_keyword_ids'])) {
                        $isInGroup = true;
                        break;
                    }
                }
            }
            if (!$isInGroup) {
                JobDefinition::create([
                    'hr_project_id' => $hrProject->id,
                    'job_keyword_id' => $jobKeywordId,
                    'job_name' => JobKeyword::find($jobKeywordId)->name ?? '',
                    'grouped_job_keyword_ids' => null,
                    'is_finalized' => false,
                ]);
            }
        }

        if (!empty($validated['job_selections']['grouped_jobs'])) {
            foreach ($validated['job_selections']['grouped_jobs'] as $groupedJob) {
                JobDefinition::create([
                    'hr_project_id' => $hrProject->id,
                    'job_keyword_id' => null,
                    'job_name' => $groupedJob['name'],
                    'grouped_job_keyword_ids' => $groupedJob['job_keyword_ids'],
                    'is_finalized' => false,
                ]);
            }
        }

        return redirect()->route('hr-manager.job-analysis.index', [$hrProject, 'job-definition']);
    }

    /**
     * Save a single job definition (incremental save). Id can be job definition id or job_keyword_id for lookup.
     */
    public function storeJobDefinition(Request $request, HrProject $hrProject, int $id)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'job_description' => ['nullable', 'string'],
            'job_specification' => ['nullable', 'array'],
            'competency_levels' => ['nullable', 'array'],
            'csfs' => ['nullable', 'array'],
        ]);

        $jobDefinition = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', false)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('job_keyword_id', $id);
            })
            ->firstOrFail();

        $jobDefinition->update([
            'job_description' => $validated['job_description'] ?? $jobDefinition->job_description,
            'job_specification' => $validated['job_specification'] ?? $jobDefinition->job_specification,
            'competency_levels' => $validated['competency_levels'] ?? $jobDefinition->competency_levels,
            'csfs' => $validated['csfs'] ?? $jobDefinition->csfs,
        ]);

        return back();
    }

    /**
     * Save org chart mappings to database (incremental save).
     */
    public function storeOrgChartMapping(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'org_chart_mappings' => ['required', 'array'],
            'org_chart_mappings.*.org_unit_name' => ['required', 'string'],
            'org_chart_mappings.*.job_keyword_ids' => ['nullable', 'array'],
            'org_chart_mappings.*.job_keyword_ids.*' => ['exists:job_keywords,id'],
            'org_chart_mappings.*.org_head_name' => ['nullable', 'string'],
            'org_chart_mappings.*.org_head_rank' => ['nullable', 'string'],
            'org_chart_mappings.*.org_head_title' => ['nullable', 'string'],
            'org_chart_mappings.*.org_head_email' => ['nullable', 'email'],
            'org_chart_mappings.*.job_specialists' => ['nullable', 'array'],
        ]);

        OrgChartMapping::where('hr_project_id', $hrProject->id)->delete();

        foreach ($validated['org_chart_mappings'] as $mapping) {
            if (empty(trim($mapping['org_unit_name'] ?? ''))) {
                continue;
            }
            OrgChartMapping::create([
                'hr_project_id' => $hrProject->id,
                'org_unit_name' => $mapping['org_unit_name'],
                'job_keyword_ids' => $mapping['job_keyword_ids'] ?? [],
                'org_head_name' => $mapping['org_head_name'] ?? null,
                'org_head_rank' => $mapping['org_head_rank'] ?? null,
                'org_head_title' => $mapping['org_head_title'] ?? null,
                'org_head_email' => $mapping['org_head_email'] ?? null,
                'job_specialists' => $mapping['job_specialists'] ?? [],
            ]);
        }

        return back();
    }

    /**
     * Finalize all job analysis data.
     * This is the ONLY place where data is saved to database (except org chart mappings which are saved at submit).
     */
    public function finalize(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'policy_answers' => ['nullable', 'array'],
            'policy_answers.*.question_id' => ['required', 'exists:policy_snapshot_questions,id'],
            'policy_answers.*.answer' => ['required', 'string', 'in:yes,no,not_sure'],
            'policy_answers.*.conditional_text' => ['nullable', 'string'],
            'job_selections' => ['required', 'array'],
            'job_selections.selected_job_keyword_ids' => ['nullable', 'array'],
            'job_selections.selected_job_keyword_ids.*' => ['exists:job_keywords,id'],
            'job_selections.custom_jobs' => ['nullable', 'array'],
            'job_selections.custom_jobs.*' => ['required', 'string', 'max:255'],
            'job_selections.grouped_jobs' => ['nullable', 'array'],
            'job_selections.grouped_jobs.*.name' => ['required', 'string'],
            'job_selections.grouped_jobs.*.job_keyword_ids' => ['required', 'array'],
            'job_selections.grouped_jobs.*.job_keyword_ids.*' => ['exists:job_keywords,id'],
            'job_definitions' => ['required', 'array'],
            'job_definitions.*.job_keyword_id' => ['nullable', 'exists:job_keywords,id'],
            'job_definitions.*.job_name' => ['required', 'string'],
            'job_definitions.*.grouped_job_keyword_ids' => ['nullable', 'array'],
            'job_definitions.*.job_description' => ['nullable', 'string'],
            'job_definitions.*.job_specification' => ['nullable', 'array'],
            'job_definitions.*.competency_levels' => ['nullable', 'array'],
            'job_definitions.*.csfs' => ['nullable', 'array'],
        ]);

        // Validate that at least one job is selected
        $hasSelectedJobs = !empty($validated['job_selections']['selected_job_keyword_ids']) && count($validated['job_selections']['selected_job_keyword_ids']) > 0;
        $hasCustomJobs = !empty($validated['job_selections']['custom_jobs']) && count($validated['job_selections']['custom_jobs']) > 0;
        $hasGroupedJobs = !empty($validated['job_selections']['grouped_jobs']) && count($validated['job_selections']['grouped_jobs']) > 0;

        if (!$hasSelectedJobs && !$hasCustomJobs && !$hasGroupedJobs) {
            return back()->withErrors([
                'job_selections' => 'Please select at least one job, add a custom job, or create a grouped job before finalizing.'
            ]);
        }

        // Delete existing non-finalized job definitions
        JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', false)
            ->delete();

        // Save Policy Snapshot Answers
        if (!empty($validated['policy_answers'])) {
            foreach ($validated['policy_answers'] as $answerData) {
                PolicySnapshotAnswer::updateOrCreate(
                    [
                        'hr_project_id' => $hrProject->id,
                        'question_id' => $answerData['question_id'],
                    ],
                    [
                        'answer' => $answerData['answer'],
                        'conditional_text' => $answerData['conditional_text'] ?? null,
                    ]
                );
            }
        }

        // Get diagnosis and size range for custom jobs
        $diagnosis = $hrProject->diagnosis;
        $workforce = $diagnosis->present_headcount ?? 0;
        $sizeRange = $this->determineSizeRange($workforce);

        // Create custom job keywords if provided
        $customJobKeywordIds = [];
        if (!empty($validated['job_selections']['custom_jobs'])) {
            foreach ($validated['job_selections']['custom_jobs'] as $customJobName) {
                $customJobKeyword = JobKeyword::create([
                    'name' => $customJobName,
                    'industry_category' => $diagnosis->industry_category ?? null,
                    'company_size_range' => $sizeRange,
                    'order' => JobKeyword::max('order') + 1,
                    'is_active' => true,
                ]);
                $customJobKeywordIds[] = $customJobKeyword->id;
            }
        }

        // Combine selected and custom job keyword IDs
        $allJobKeywordIds = array_merge(
            $validated['job_selections']['selected_job_keyword_ids'] ?? [],
            $customJobKeywordIds
        );

        // Create job definitions for ungrouped selected jobs (including custom)
        foreach ($allJobKeywordIds as $jobKeywordId) {
            // Skip if this job is part of a grouped job
            $isInGroup = false;
            if (!empty($validated['job_selections']['grouped_jobs'])) {
                foreach ($validated['job_selections']['grouped_jobs'] as $groupedJob) {
                    if (in_array($jobKeywordId, $groupedJob['job_keyword_ids'])) {
                        $isInGroup = true;
                        break;
                    }
                }
            }
            
            if (!$isInGroup) {
                // Find matching job definition data
                $jobDefData = collect($validated['job_definitions'])->first(function($jd) use ($jobKeywordId) {
                    return $jd['job_keyword_id'] == $jobKeywordId && empty($jd['grouped_job_keyword_ids']);
                });

                JobDefinition::create([
                    'hr_project_id' => $hrProject->id,
                    'job_keyword_id' => $jobKeywordId,
                    'job_name' => $jobDefData['job_name'] ?? JobKeyword::find($jobKeywordId)->name,
                    'grouped_job_keyword_ids' => null,
                    'job_description' => $jobDefData['job_description'] ?? null,
                    'job_specification' => $jobDefData['job_specification'] ?? null,
                    'competency_levels' => $jobDefData['competency_levels'] ?? null,
                    'csfs' => $jobDefData['csfs'] ?? null,
                    'is_finalized' => true,
                ]);
            }
        }

        // Create job definitions for grouped jobs
        if (!empty($validated['job_selections']['grouped_jobs'])) {
            foreach ($validated['job_selections']['grouped_jobs'] as $groupedJob) {
                // Find matching job definition data
                $jobDefData = collect($validated['job_definitions'])->first(function($jd) use ($groupedJob) {
                    return !empty($jd['grouped_job_keyword_ids']) && 
                           $jd['grouped_job_keyword_ids'] == $groupedJob['job_keyword_ids'];
                });

                JobDefinition::create([
                    'hr_project_id' => $hrProject->id,
                    'job_keyword_id' => null, // Grouped jobs don't have a single keyword
                    'job_name' => $groupedJob['name'],
                    'grouped_job_keyword_ids' => $groupedJob['job_keyword_ids'],
                    'job_description' => $jobDefData['job_description'] ?? null,
                    'job_specification' => $jobDefData['job_specification'] ?? null,
                    'competency_levels' => $jobDefData['competency_levels'] ?? null,
                    'csfs' => $jobDefData['csfs'] ?? null,
                    'is_finalized' => true,
                ]);
            }
        }

        return back()->with('success', 'Job analysis finalized successfully.');
    }

    /**
     * Submit job analysis step.
     * Saves ALL data at once: policy answers, job selections, job definitions, and org chart mappings.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'policy_answers' => ['nullable', 'array'],
            'policy_answers.*.question_id' => ['required', 'exists:policy_snapshot_questions,id'],
            'policy_answers.*.answer' => ['required', 'string', 'in:yes,no,not_sure'],
            'policy_answers.*.conditional_text' => ['nullable', 'string'],
            'job_selections' => ['required', 'array'],
            'job_selections.selected_job_keyword_ids' => ['nullable', 'array'],
            'job_selections.selected_job_keyword_ids.*' => ['exists:job_keywords,id'],
            'job_selections.custom_jobs' => ['nullable', 'array'],
            'job_selections.custom_jobs.*' => ['required', 'string', 'max:255'],
            'job_selections.grouped_jobs' => ['nullable', 'array'],
            'job_selections.grouped_jobs.*.name' => ['required', 'string'],
            'job_selections.grouped_jobs.*.job_keyword_ids' => ['required', 'array'],
            'job_selections.grouped_jobs.*.job_keyword_ids.*' => ['exists:job_keywords,id'],
            'job_definitions' => ['required', 'array'],
            'job_definitions.*.job_keyword_id' => ['nullable', 'exists:job_keywords,id'],
            'job_definitions.*.job_name' => ['required', 'string'],
            'job_definitions.*.grouped_job_keyword_ids' => ['nullable', 'array'],
            'job_definitions.*.job_description' => ['nullable', 'string'],
            'job_definitions.*.job_specification' => ['nullable', 'array'],
            'job_definitions.*.competency_levels' => ['nullable', 'array'],
            'job_definitions.*.csfs' => ['nullable', 'array'],
            'org_chart_mappings' => ['required', 'array'],
            'org_chart_mappings.*.org_unit_name' => ['required', 'string'],
            'org_chart_mappings.*.job_keyword_ids' => ['nullable', 'array'],
            'org_chart_mappings.*.job_keyword_ids.*' => ['exists:job_keywords,id'],
            'org_chart_mappings.*.org_head_name' => ['nullable', 'string'],
            'org_chart_mappings.*.org_head_rank' => ['nullable', 'string'],
            'org_chart_mappings.*.org_head_title' => ['nullable', 'string'],
            'org_chart_mappings.*.org_head_email' => ['nullable', 'email'],
            'org_chart_mappings.*.job_specialists' => ['nullable', 'array'],
        ]);

        // Validate that at least one job is selected
        $hasSelectedJobs = !empty($validated['job_selections']['selected_job_keyword_ids']) && count($validated['job_selections']['selected_job_keyword_ids']) > 0;
        $hasCustomJobs = !empty($validated['job_selections']['custom_jobs']) && count($validated['job_selections']['custom_jobs']) > 0;
        $hasGroupedJobs = !empty($validated['job_selections']['grouped_jobs']) && count($validated['job_selections']['grouped_jobs']) > 0;

        if (!$hasSelectedJobs && !$hasCustomJobs && !$hasGroupedJobs) {
            return back()->withErrors([
                'job_selections' => 'Please select at least one job, add a custom job, or create a grouped job before submitting.'
            ]);
        }

        // Delete existing non-finalized job definitions
        JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', false)
            ->delete();

        // Save Policy Snapshot Answers
        if (!empty($validated['policy_answers'])) {
            foreach ($validated['policy_answers'] as $answerData) {
                PolicySnapshotAnswer::updateOrCreate(
                    [
                        'hr_project_id' => $hrProject->id,
                        'question_id' => $answerData['question_id'],
                    ],
                    [
                        'answer' => $answerData['answer'],
                        'conditional_text' => $answerData['conditional_text'] ?? null,
                    ]
                );
            }
        }

        // Get diagnosis and size range for custom jobs
        $diagnosis = $hrProject->diagnosis;
        $workforce = $diagnosis->present_headcount ?? 0;
        $sizeRange = $this->determineSizeRange($workforce);

        // Create custom job keywords if provided
        $customJobKeywordIds = [];
        if (!empty($validated['job_selections']['custom_jobs'])) {
            foreach ($validated['job_selections']['custom_jobs'] as $customJobName) {
                $customJobKeyword = JobKeyword::create([
                    'name' => $customJobName,
                    'industry_category' => $diagnosis->industry_category ?? null,
                    'company_size_range' => $sizeRange,
                    'order' => JobKeyword::max('order') + 1,
                    'is_active' => true,
                ]);
                $customJobKeywordIds[] = $customJobKeyword->id;
            }
        }

        // Combine selected and custom job keyword IDs
        $allJobKeywordIds = array_merge(
            $validated['job_selections']['selected_job_keyword_ids'] ?? [],
            $customJobKeywordIds
        );

        // Create job definitions for ungrouped selected jobs (including custom)
        foreach ($allJobKeywordIds as $jobKeywordId) {
            // Skip if this job is part of a grouped job
            $isInGroup = false;
            if (!empty($validated['job_selections']['grouped_jobs'])) {
                foreach ($validated['job_selections']['grouped_jobs'] as $groupedJob) {
                    if (in_array($jobKeywordId, $groupedJob['job_keyword_ids'])) {
                        $isInGroup = true;
                        break;
                    }
                }
            }
            
            if (!$isInGroup) {
                // Find matching job definition data
                $jobDefData = collect($validated['job_definitions'])->first(function($jd) use ($jobKeywordId) {
                    return $jd['job_keyword_id'] == $jobKeywordId && empty($jd['grouped_job_keyword_ids']);
                });

                JobDefinition::create([
                    'hr_project_id' => $hrProject->id,
                    'job_keyword_id' => $jobKeywordId,
                    'job_name' => $jobDefData['job_name'] ?? JobKeyword::find($jobKeywordId)->name,
                    'grouped_job_keyword_ids' => null,
                    'job_description' => $jobDefData['job_description'] ?? null,
                    'job_specification' => $jobDefData['job_specification'] ?? null,
                    'competency_levels' => $jobDefData['competency_levels'] ?? null,
                    'csfs' => $jobDefData['csfs'] ?? null,
                    'is_finalized' => true,
                ]);
            }
        }

        // Create job definitions for grouped jobs
        if (!empty($validated['job_selections']['grouped_jobs'])) {
            foreach ($validated['job_selections']['grouped_jobs'] as $groupedJob) {
                // Find matching job definition data
                $jobDefData = collect($validated['job_definitions'])->first(function($jd) use ($groupedJob) {
                    return !empty($jd['grouped_job_keyword_ids']) && 
                           $jd['grouped_job_keyword_ids'] == $groupedJob['job_keyword_ids'];
                });

                JobDefinition::create([
                    'hr_project_id' => $hrProject->id,
                    'job_keyword_id' => null,
                    'job_name' => $groupedJob['name'],
                    'grouped_job_keyword_ids' => $groupedJob['job_keyword_ids'],
                    'job_description' => $jobDefData['job_description'] ?? null,
                    'job_specification' => $jobDefData['job_specification'] ?? null,
                    'competency_levels' => $jobDefData['competency_levels'] ?? null,
                    'csfs' => $jobDefData['csfs'] ?? null,
                    'is_finalized' => true,
                ]);
            }
        }

        // Check if all required steps are completed
        $jobDefinitionsCount = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->count();

        if ($jobDefinitionsCount === 0) {
            return back()->withErrors(['error' => 'Please finalize at least one job definition before submitting.']);
        }

        // Delete existing mappings
        OrgChartMapping::where('hr_project_id', $hrProject->id)->delete();

        // Save org chart mappings
        foreach ($validated['org_chart_mappings'] as $mappingData) {
            OrgChartMapping::create([
                'hr_project_id' => $hrProject->id,
                'org_unit_name' => $mappingData['org_unit_name'],
                'job_keyword_ids' => $mappingData['job_keyword_ids'] ?? [],
                'org_head_name' => $mappingData['org_head_name'] ?? null,
                'org_head_rank' => $mappingData['org_head_rank'] ?? null,
                'org_head_title' => $mappingData['org_head_title'] ?? null,
                'org_head_email' => $mappingData['org_head_email'] ?? null,
                'job_specialists' => $mappingData['job_specialists'] ?? [],
            ]);
        }

        // Submit the step
        $this->stepTransitionService->submitStep($hrProject, 'job_analysis');

        // Unlock next step
        $this->workflowStateService->unlockNextStep($hrProject, 'job_analysis');

        return redirect()->route('hr-manager.dashboard')
            ->with('success', 'Job Analysis submitted successfully. You can now proceed to Performance System.');
    }

    /**
     * Show Job Analysis intro page for CEO.
     * CEO can view all job analysis data for verification.
     */
    public function ceoIntro(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        $hrProject->load(['diagnosis', 'company']);

        // Load intro text
        $introText = JobAnalysisIntro::getActiveByKey('hr_job_analysis_intro');

        // Load policy snapshot questions and answers
        $questions = PolicySnapshotQuestion::where('is_active', true)
            ->orderBy('order')
            ->get();

        $policyAnswers = PolicySnapshotAnswer::where('hr_project_id', $hrProject->id)
            ->get()
            ->keyBy('question_id')
            ->map(function($answer) {
                return [
                    'answer' => $answer->answer,
                    'conditional_text' => $answer->conditional_text,
                ];
            })
            ->toArray();

        // Load job keywords and definitions
        $diagnosis = $hrProject->diagnosis;
        $industry = $diagnosis->industry_category ?? null;
        $workforce = $diagnosis->present_headcount ?? 0;
        $sizeRange = $this->determineSizeRange($workforce);

        $suggestedJobs = JobKeyword::where(function($query) use ($industry, $sizeRange) {
            $query->whereNull('industry_category')
                  ->orWhere('industry_category', $industry);
        })
        ->where(function($query) use ($sizeRange) {
            $query->whereNull('company_size_range')
                  ->orWhere('company_size_range', $sizeRange);
        })
        ->where('is_active', true)
        ->orderBy('order')
        ->get();

        // Get all job definitions (finalized)
        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->with('jobKeyword')
            ->orderBy('job_name')
            ->get();

        // Load org chart mappings
        $orgMappings = OrgChartMapping::where('hr_project_id', $hrProject->id)->get();

        // Check step status
        $stepStatuses = $hrProject->step_statuses ?? [];
        $jobAnalysisStatus = $stepStatuses['job_analysis'] ?? 'not_started';
        $introCompleted = in_array($jobAnalysisStatus, ['in_progress', 'submitted', 'approved', 'locked']);

        return Inertia::render('CEO/JobAnalysis/Index', [
            'project' => $hrProject,
            'introText' => $introText ? [
                'title' => $introText->title,
                'content' => $introText->content,
            ] : null,
            'questions' => $questions,
            'policyAnswers' => $policyAnswers,
            'suggestedJobs' => $suggestedJobs,
            'jobDefinitions' => $jobDefinitions,
            'orgMappings' => $orgMappings,
            'industry' => $industry,
            'sizeRange' => $sizeRange,
            'introCompleted' => $introCompleted,
            'stepStatuses' => $stepStatuses,
        ]);
    }
}
