<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\PolicySnapshotQuestion;
use App\Models\JobKeyword;
use App\Models\JobDefinition;
use App\Models\JobDefinitionTemplate;
use App\Models\OrgChartMapping;
use App\Models\IntroText;
use App\Enums\StepStatus;
use App\Services\StepTransitionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobAnalysisController extends Controller
{
    public function __construct(
        protected StepTransitionService $stepTransitionService
    ) {
    }
    /**
     * Show intro page.
     */
    public function intro(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('job_analysis')) {
            return redirect()->route('hr-manager.dashboard')
                ->withErrors(['error' => 'Job Analysis step is not yet unlocked.']);
        }

        $introText = IntroText::where('key', 'hr_job_analysis_intro')
            ->where('is_active', true)
            ->first();

        // Check if intro has been completed
        $stepStatuses = $hrProject->step_statuses ?? [];
        $jobAnalysisStatus = $stepStatuses['job_analysis'] ?? 'not_started';
        $introCompleted = in_array($jobAnalysisStatus, ['in_progress', 'submitted', 'approved', 'locked']);

        return Inertia::render('OrganizationDesign/Intro', [
            'project' => $hrProject,
            'introText' => $introText,
            'introCompleted' => $introCompleted,
        ]);
    }

    /**
     * Show intro page for CEO (view only).
     */
    public function ceoIntro(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        $introText = IntroText::where('key', 'hr_job_analysis_intro')
            ->where('is_active', true)
            ->first();

        // Check if intro has been completed
        $stepStatuses = $hrProject->step_statuses ?? [];
        $jobAnalysisStatus = $stepStatuses['job_analysis'] ?? 'not_started';
        $introCompleted = in_array($jobAnalysisStatus, ['in_progress', 'submitted', 'approved', 'locked']);

        // Check if CEO philosophy survey is completed
        $hrProject->load('ceoPhilosophy');
        $surveyDone = $hrProject->ceoPhilosophy && $hrProject->ceoPhilosophy->completed_at !== null;

        return Inertia::render('OrganizationDesign/CeoIntro', [
            'project' => $hrProject,
            'introText' => $introText,
            'introCompleted' => $introCompleted,
            'surveyDone' => $surveyDone,
        ]);
    }

    /**
     * Store intro completion and start job analysis.
     */
    public function storeIntro(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Mark job analysis as in progress
        $hrProject->setStepStatus('job_analysis', StepStatus::IN_PROGRESS);

        return redirect()->route('hr-manager.job-analysis.policy-snapshot', $hrProject)
            ->with('success', 'Job Analysis started successfully.');
    }

    /**
     * Show policy snapshot page.
     */
    public function policySnapshot(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $questions = PolicySnapshotQuestion::where('is_active', true)
            ->orderBy('order')
            ->get();

        return Inertia::render('OrganizationDesign/PolicySnapshot', [
            'project' => $hrProject,
            'questions' => $questions,
        ]);
    }

    /**
     * Store policy snapshot answers.
     */
    public function storePolicySnapshot(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'answers' => ['nullable', 'array'],
            'answers.*.question_id' => ['required', 'exists:policy_snapshot_questions,id'],
            'answers.*.answer' => ['required', 'string', 'in:yes,no,not_sure'],
            'answers.*.conditional_text' => ['nullable', 'string'],
        ]);

        // Store answers if provided (answers are optional)
        if (!empty($validated['answers'])) {
            // Store answers (you may want to create a policy_snapshot_answers table)
            // For now, store in organization_design or a separate table
            // You can create a PolicySnapshotAnswer model if needed
        }
        
        return redirect()->route('hr-manager.job-analysis.job-list-selection', $hrProject)
            ->with('success', 'Policy snapshot saved successfully.');
    }

    /**
     * Show job list selection page.
     */
    public function jobListSelection(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $diagnosis = $hrProject->diagnosis;
        $industry = $diagnosis->industry_category ?? null;
        $workforce = $diagnosis->present_headcount ?? 0;
        
        // Determine company size range
        $sizeRange = $this->determineSizeRange($workforce);

        // Get suggested job keywords based on industry and size
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

        $selectedJobs = JobDefinition::where('hr_project_id', $hrProject->id)
            ->whereNull('is_finalized')
            ->get();

        return Inertia::render('OrganizationDesign/JobListSelection', [
            'project' => $hrProject,
            'suggestedJobs' => $suggestedJobs,
            'selectedJobs' => $selectedJobs,
            'industry' => $industry,
            'sizeRange' => $sizeRange,
        ]);
    }

    /**
     * Store job list selection.
     */
    public function storeJobListSelection(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'selected_job_keyword_ids' => ['required', 'array'],
            'selected_job_keyword_ids.*' => ['exists:job_keywords,id'],
            'grouped_jobs' => ['nullable', 'array'],
            'grouped_jobs.*.name' => ['required', 'string'],
            'grouped_jobs.*.job_keyword_ids' => ['required', 'array'],
            'grouped_jobs.*.job_keyword_ids.*' => ['exists:job_keywords,id'],
        ]);

        // Delete existing non-finalized job definitions
        JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', false)
            ->delete();

        // Create job definitions for ungrouped selected jobs
        foreach ($validated['selected_job_keyword_ids'] as $jobKeywordId) {
            JobDefinition::create([
                'hr_project_id' => $hrProject->id,
                'job_keyword_id' => $jobKeywordId,
                'job_name' => JobKeyword::find($jobKeywordId)->name,
                'is_finalized' => false,
            ]);
        }

        // Create job definitions for grouped jobs
        if (isset($validated['grouped_jobs'])) {
            foreach ($validated['grouped_jobs'] as $groupedJob) {
                JobDefinition::create([
                    'hr_project_id' => $hrProject->id,
                    'job_keyword_id' => $groupedJob['job_keyword_ids'][0] ?? null, // Use first job as primary
                    'job_name' => $groupedJob['name'],
                    'grouped_job_keyword_ids' => $groupedJob['job_keyword_ids'],
                    'is_finalized' => false,
                ]);
            }
        }

        return back()->with('success', 'Job list selection saved successfully.');
    }

    /**
     * Show job definition page.
     */
    public function jobDefinition(Request $request, HrProject $hrProject, JobDefinition $jobDefinition = null)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', false)
            ->with('jobKeyword')
            ->get();

        $diagnosis = $hrProject->diagnosis;
        $industry = $diagnosis->industry_category ?? null;
        $workforce = $diagnosis->present_headcount ?? 0;
        $sizeRange = $this->determineSizeRange($workforce);

        $selectedJob = $jobDefinition ?? $jobDefinitions->first();

        // Load template if exists
        $template = null;
        if ($selectedJob && $selectedJob->job_keyword_id) {
            $template = JobDefinitionTemplate::where('job_keyword_id', $selectedJob->job_keyword_id)
                ->where(function($query) use ($industry, $sizeRange) {
                    $query->whereNull('industry_category')->orWhere('industry_category', $industry);
                    $query->where(function($q) use ($sizeRange) {
                        $q->whereNull('company_size_range')->orWhere('company_size_range', $sizeRange);
                    });
                })
                ->first();
        }

        return Inertia::render('OrganizationDesign/JobDefinition', [
            'project' => $hrProject,
            'jobDefinitions' => $jobDefinitions,
            'selectedJob' => $selectedJob,
            'template' => $template,
        ]);
    }

    /**
     * Store job definition.
     */
    public function storeJobDefinition(Request $request, HrProject $hrProject, JobDefinition $jobDefinition)
    {
        // Check if job definition is finalized
        if ($jobDefinition->is_finalized && !$request->user()->hasRole('admin')) {
            return back()->withErrors(['error' => 'This job definition has been finalized and cannot be edited. Please contact admin for changes.']);
        }

        $validated = $request->validate([
            'job_description' => ['nullable', 'string'],
            'job_specification' => ['nullable', 'array'],
            'competency_levels' => ['nullable', 'array'],
            'csfs' => ['nullable', 'array'],
        ]);

        $jobDefinition->update($validated);

        return back()->with('success', 'Job definition saved successfully.');
    }

    /**
     * Show finalization page.
     */
    public function finalization(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', false)
            ->with('jobKeyword')
            ->get();

        return Inertia::render('OrganizationDesign/Finalization', [
            'project' => $hrProject,
            'jobDefinitions' => $jobDefinitions,
        ]);
    }

    /**
     * Finalize job definitions.
     */
    public function finalize(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if there are any job definitions to finalize
        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', false)
            ->count();

        if ($jobDefinitions === 0) {
            return back()->withErrors(['error' => 'No job definitions to finalize.']);
        }

        JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', false)
            ->update(['is_finalized' => true]);

        return redirect()->route('hr-manager.job-analysis.org-chart-mapping', $hrProject)
            ->with('success', 'Job definitions finalized successfully.');
    }

    /**
     * Show org chart mapping page.
     */
    public function orgChartMapping(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->with('jobKeyword')
            ->get();

        $mappings = OrgChartMapping::where('hr_project_id', $hrProject->id)->get();
        $diagnosis = $hrProject->diagnosis;

        return Inertia::render('OrganizationDesign/OrgChartMapping', [
            'project' => $hrProject,
            'jobDefinitions' => $jobDefinitions,
            'mappings' => $mappings,
            'organizationalCharts' => $diagnosis->organizational_charts ?? [],
        ]);
    }

    /**
     * Store org chart mapping.
     */
    public function storeOrgChartMapping(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'mappings' => ['required', 'array'],
            'mappings.*.org_unit_name' => ['required', 'string'],
            'mappings.*.job_keyword_ids' => ['nullable', 'array'],
            'mappings.*.org_head' => ['nullable', 'array'],
            'mappings.*.job_specialists' => ['nullable', 'array'],
        ]);

        foreach ($validated['mappings'] as $mappingData) {
            OrgChartMapping::updateOrCreate(
                [
                    'hr_project_id' => $hrProject->id,
                    'org_unit_name' => $mappingData['org_unit_name'],
                ],
                [
                    'job_keyword_ids' => $mappingData['job_keyword_ids'] ?? [],
                    'org_head_name' => $mappingData['org_head']['name'] ?? null,
                    'org_head_rank' => $mappingData['org_head']['rank'] ?? null,
                    'org_head_title' => $mappingData['org_head']['title'] ?? null,
                    'org_head_email' => $mappingData['org_head']['email'] ?? null,
                    'job_specialists' => $mappingData['job_specialists'] ?? [],
                ]
            );
        }

        return back()->with('success', 'Organization chart mapping saved successfully.');
    }

    /**
     * Submit Job Analysis step.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if all required steps are completed
        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->count();

        if ($jobDefinitions === 0) {
            return back()->withErrors(['error' => 'Please finalize at least one job definition before submitting.']);
        }

        // Submit the step
        $this->stepTransitionService->submitStep($hrProject, 'job_analysis');

        return redirect()->route('hr-manager.dashboard')
            ->with('success', 'Job Analysis submitted successfully.');
    }

    /**
     * Determine company size range from workforce.
     */
    private function determineSizeRange(int $workforce): string
    {
        if ($workforce <= 50) return '1-50';
        if ($workforce <= 200) return '51-200';
        if ($workforce <= 500) return '201-500';
        return '500+';
    }
}
