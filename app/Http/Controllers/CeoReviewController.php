<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\CeoReviewLog;
use App\Models\HrProject;
use App\Notifications\CeoDiagnosisConfirmedNotification;
use App\Services\AuditLogService;
use App\Services\DiagnosisSnapshotService;
use App\Services\StepTransitionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class CeoReviewController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected DiagnosisSnapshotService $snapshotService,
        protected StepTransitionService $stepTransitionService
    ) {
    }

    /**
     * Show diagnosis review page.
     */
    public function reviewDiagnosis(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        $hrProject->load(['diagnosis', 'company', 'ceoPhilosophy']);

        // CEO must complete the philosophy survey before they can review/verify diagnosis.
        // If a new CEO account hasn't finished the survey yet (or only has an in-progress record),
        // redirect to the survey start page to keep the flow consistent.
        if (!($hrProject->ceoPhilosophy && $hrProject->ceoPhilosophy->completed_at)) {
            return redirect()->route('ceo.philosophy.survey', ['hrProject' => $hrProject->id])
                ->with('info', 'Please complete the CEO Philosophy Survey first.');
        }

        $reviewLogs = CeoReviewLog::where('hr_project_id', $hrProject->id)
            ->with('modifier')
            ->orderBy('created_at', 'desc')
            ->get();

        // Load industry categories with subcategories
        $industryCategories = \App\Models\IndustryCategory::with('subCategories')
            ->orderBy('order')
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'subCategories' => $category->subCategories->map(function ($sub) {
                        return [
                            'id' => $sub->id,
                            'name' => $sub->name,
                        ];
                    })->toArray(),
                ];
            })->toArray();

        // Load HQ locations
        $hqLocations = \App\Models\Setting::where('key', 'hq_locations')
            ->first();
        $hqLocationsList = $hqLocations ? json_decode($hqLocations->value, true) : [];

        // Load HR issues
        $hrIssues = \App\Models\HrIssue::where('is_active', true)
            ->orderBy('category')
            ->orderBy('order')
            ->get();

        return \Inertia\Inertia::render('CEO/Review/Diagnosis', [
            'project' => $hrProject,
            'diagnosis' => $hrProject->diagnosis,
            'company' => $hrProject->company,
            'reviewLogs' => $reviewLogs,
            'industryCategories' => $industryCategories,
            'hqLocations' => $hqLocationsList,
            'hrIssues' => $hrIssues,
        ]);
    }

    /**
     * Update diagnosis data (CEO edits).
     */
    public function updateDiagnosis(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        $diagnosis = $hrProject->diagnosis;

        // Enforce survey-first flow.
        $hrProject->loadMissing('ceoPhilosophy');
        if (!($hrProject->ceoPhilosophy && $hrProject->ceoPhilosophy->completed_at)) {
            return redirect()->route('ceo.philosophy.survey', ['hrProject' => $hrProject->id])
                ->with('info', 'Please complete the CEO Philosophy Survey first.');
        }
        
        if (!$diagnosis || $diagnosis->status !== StepStatus::SUBMITTED) {
            return back()->withErrors(['error' => 'Diagnosis must be submitted before review.']);
        }

        // Validate the request data
        $validated = $request->validate([
            'is_public' => ['nullable', 'boolean'],
            'registration_number' => ['nullable', 'string', 'max:255'],
            'hq_location' => ['nullable', 'string', 'max:255'],
            'brand_name' => ['nullable', 'string', 'max:255'],
            'foundation_date' => ['nullable', 'string', 'max:255'],
            'industry_category' => ['nullable', 'string', 'max:255'],
            'industry_subcategory' => ['nullable', 'string', 'max:255'],
            'industry_other' => ['nullable', 'string', 'max:255'],
            'industry_category_other' => ['nullable', 'string', 'max:255'],
            'secondary_industries' => ['nullable', 'array'],
            'secondary_industries.*' => ['string'],
            'present_headcount' => ['nullable', 'integer', 'min:0'],
            'expected_headcount_1y' => ['nullable', 'integer', 'min:0'],
            'expected_headcount_2y' => ['nullable', 'integer', 'min:0'],
            'expected_headcount_3y' => ['nullable', 'integer', 'min:0'],
            'average_tenure_active' => ['nullable', 'numeric', 'min:0'],
            'average_tenure_leavers' => ['nullable', 'numeric', 'min:0'],
            'average_age' => ['nullable', 'numeric', 'min:0'],
            'gender_male' => ['nullable', 'integer', 'min:0'],
            'gender_female' => ['nullable', 'integer', 'min:0'],
            'total_executives' => ['nullable', 'integer', 'min:0'],
            'executive_positions' => ['nullable', 'array'],
            'leadership_count' => ['nullable', 'integer', 'min:0'],
            'job_grade_names' => ['nullable', 'array'],
            'promotion_years' => ['nullable', 'array'],
            'org_structure_types' => ['nullable', 'array'],
            'hr_issues' => ['nullable', 'array'],
            'custom_hr_issues' => ['nullable', 'string'],
            'job_categories' => ['nullable', 'array'],
            'job_functions' => ['nullable', 'array'],
        ]);

        $data = $validated;
        $originalData = $diagnosis->toArray();

        DB::transaction(function () use ($diagnosis, $data, $request, $hrProject, $originalData) {
            $company = $hrProject->company;
            $companyUpdates = [];

            // Update company fields (form sends company data alongside diagnosis)
            $companyFields = ['is_public', 'registration_number', 'hq_location', 'brand_name', 'foundation_date'];
            foreach ($companyFields as $field) {
                if (!array_key_exists($field, $data)) {
                    continue;
                }
                $value = $data[$field];
                $current = $field === 'is_public' ? ($company->is_public ? 'true' : 'false') : ($company->$field ?? '');
                $newStr = $field === 'is_public' ? ($value ? 'true' : 'false') : (string) $value;
                if ($current != $newStr) {
                    CeoReviewLog::create([
                        'hr_project_id' => $hrProject->id,
                        'field_name' => 'company.' . $field,
                        'field_type' => 'company',
                        'original_value' => $current,
                        'modified_value' => $newStr,
                        'modified_by' => $request->user()->id,
                    ]);
                }
                if ($field === 'is_public') {
                    $companyUpdates['is_public'] = (bool) $value;
                } else {
                    $companyUpdates[$field] = $value;
                }
                unset($data[$field]);
            }
            if (!empty($companyUpdates)) {
                $company->update($companyUpdates);
            }

            // Track changes
            foreach ($data as $field => $value) {
                if ($field === '_token' || $field === '_method') {
                    continue;
                }

                $originalValue = $originalData[$field] ?? null;
                
                // Convert arrays/objects to JSON strings for comparison
                if (is_array($originalValue) || is_object($originalValue)) {
                    $originalValue = json_encode($originalValue);
                }
                if (is_array($value) || is_object($value)) {
                    $value = json_encode($value);
                }

                if ($originalValue != $value) {
                    CeoReviewLog::create([
                        'hr_project_id' => $hrProject->id,
                        'field_name' => $field,
                        'field_type' => 'diagnosis',
                        'original_value' => $originalValue,
                        'modified_value' => $value,
                        'modified_by' => $request->user()->id,
                    ]);
                }
            }

            // Update diagnosis
            $diagnosis->update($data);
        });

        // Reload relationships to ensure fresh data
        $hrProject->load(['diagnosis', 'company']);
        $diagnosis->refresh();
        $hrProject->company->refresh();

        return back();
    }

    /**
     * Confirm and approve diagnosis.
     * CEO must complete the Management Philosophy Survey before they can verify (confirm) the diagnosis.
     */
    public function confirmDiagnosis(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        $diagnosis = $hrProject->diagnosis;

        if (!$diagnosis || $diagnosis->status !== StepStatus::SUBMITTED) {
            return back()->withErrors(['error' => 'Diagnosis must be submitted before approval.']);
        }

        // Require CEO to complete the Management Philosophy Survey before verifying diagnosis
        if (!($hrProject->ceoPhilosophy && $hrProject->ceoPhilosophy->completed_at)) {
            return redirect()->route('ceo.philosophy.survey', ['hrProject' => $hrProject->id])
                ->with('error', 'Complete the Management Philosophy Survey first to verify the diagnosis.');
        }

        try {
            // Create snapshot
            $this->snapshotService->createSnapshot($hrProject);

            // Defensive sync: some older records have diagnosis model status as SUBMITTED
            // but project step_statuses['diagnosis'] not aligned, which can throw 500.
            $projectStepStatus = $hrProject->getStepStatus('diagnosis');
            if ($projectStepStatus !== StepStatus::SUBMITTED) {
                $hrProject->setStepStatus('diagnosis', StepStatus::SUBMITTED);
            }

            // Approve and lock diagnosis step (this will unlock organization design)
            $this->stepTransitionService->approveAndLockStep($hrProject, 'diagnosis');
        } catch (\Throwable $e) {
            Log::error('CEO confirmDiagnosis failed', [
                'hr_project_id' => $hrProject->id,
                'diagnosis_id' => $diagnosis?->id,
                'diagnosis_status' => $diagnosis?->status?->value ?? (string) $diagnosis?->status,
                'project_step_status' => $hrProject->getStepStatus('diagnosis')?->value,
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Unable to proceed to next step right now. Please refresh and try again.',
            ]);
        }

        // Notify HR manager(s) that CEO has completed diagnosis and next step is open
        $hrManagers = $hrProject->company->hrManagers()->get();
        foreach ($hrManagers as $hrManager) {
            Notification::send($hrManager, new CeoDiagnosisConfirmedNotification($hrProject));
        }

        return redirect()->route('ceo.review.diagnosis', $hrProject)
            ->with('success', 'Diagnosis confirmed and locked.');
    }

    /**
     * Verify/Approve a specific step.
     */
    public function verifyStep(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        $request->validate([
            'step' => ['required', 'in:diagnosis,job_analysis,performance,compensation,hr_policy_os'],
        ]);

        $step = $request->step;
        $currentStatus = $hrProject->getStepStatus($step);
        $stepOrder = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'hr_policy_os'];
        $stepIndex = array_search($step, $stepOrder, true);

        // Role-based gate for diagnosis verification:
        // CEO can verify diagnosis only after HR submission + CEO survey completion.
        if ($step === 'diagnosis') {
            $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
            $hrCompleted = $diagnosisStatus && in_array($diagnosisStatus->value, ['submitted', 'approved', 'locked', 'completed'], true);
            $ceoSurveyCompleted = (bool) ($hrProject->ceoPhilosophy && $hrProject->ceoPhilosophy->completed_at);
            $diagnosisCompleted = $diagnosisStatus && in_array($diagnosisStatus->value, ['submitted', 'approved', 'locked', 'completed'], true);

            if (!$hrCompleted) {
                return back()->withErrors(['error' => 'Waiting for HR. Verification is locked until HR completes submission.']);
            }
            if (!$ceoSurveyCompleted) {
                return back()->withErrors(['error' => 'Complete Survey First. CEO survey is required before verification.']);
            }
            if (!$diagnosisCompleted) {
                return back()->withErrors(['error' => 'Pending. Diagnosis is not ready for verification.']);
            }
        }

        if (!$currentStatus || $currentStatus !== StepStatus::SUBMITTED) {
            return back()->withErrors(['error' => "Step {$step} must be submitted before verification."]);
        }

        // Enforce sequential CEO verification:
        // previous steps must already be completed (locked) before verifying current step.
        if ($stepIndex !== false && $stepIndex > 0) {
            for ($i = 0; $i < $stepIndex; $i++) {
                $prevStep = $stepOrder[$i];
                $prevStatus = $hrProject->getStepStatus($prevStep);
                if ($prevStatus !== StepStatus::LOCKED) {
                    return back()->withErrors([
                        'error' => "Please complete verification of {$prevStep} before verifying {$step}.",
                    ]);
                }
            }
        }

        // Approve and lock the step
        $this->stepTransitionService->approveAndLockStep($hrProject, $step);

        return back()->with('success', "Step {$step} verified and approved successfully.");
    }

    /**
     * Request revision for a specific step.
     */
    public function requestRevision(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        $request->validate([
            'step' => ['required', 'in:diagnosis,job_analysis,performance,compensation,hr_policy_os'],
        ]);

        $step = $request->step;
        $hrProject->setStepStatus($step, StepStatus::IN_PROGRESS);

        return back()->with('success', "Step {$step} reopened for revision.");
    }

    /**
     * Show performance system review page.
     */
    public function reviewPerformanceSystem(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        $hrProject->load([
            'diagnosis',
            'company',
            'performanceSystem',
            'performanceSnapshotResponses.question',
            'organizationalKpis.linkedJob',
            'evaluationModelAssignments.jobDefinition',
            'evaluationStructure',
        ]);

        // Auto-create PerformanceSystem record if it doesn't exist but other performance data exists
        if (!$hrProject->performanceSystem && (
            $hrProject->performanceSnapshotResponses->isNotEmpty() ||
            $hrProject->organizationalKpis->isNotEmpty() ||
            $hrProject->evaluationModelAssignments->isNotEmpty() ||
            $hrProject->evaluationStructure
        )) {
            $hrProject->performanceSystem = \App\Models\PerformanceSystem::create([
                'hr_project_id' => $hrProject->id,
                'status' => \App\Enums\StepStatus::IN_PROGRESS,
            ]);
        }

        // Load snapshot questions
        $snapshotQuestions = \App\Models\PerformanceSnapshotQuestion::where('is_active', true)
            ->orderBy('order')
            ->get();

        // Load job definitions
        $jobDefinitions = \App\Models\JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->with('jobKeyword')
            ->get();

        // Load org chart mappings
        $orgChartMappings = \App\Models\OrgChartMapping::where('hr_project_id', $hrProject->id)->get();

        // Load KPI review tokens
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

        // Get algorithm-based recommendations
        $algorithmRecommendations = app(\App\Services\RecommendationService::class)
            ->getRecommendedPerformanceMethod($hrProject);

        // Load consultant recommendation
        $consultantRecommendation = \App\Models\AdminComment::where('hr_project_id', $hrProject->id)
            ->where('is_recommendation', true)
            ->where('recommendation_type', 'performance')
            ->first();

        $stepStatuses = $hrProject->step_statuses ?? [];
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'job_analysis' => $stepStatuses['job_analysis'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
            'hr_policy_os' => $stepStatuses['hr_policy_os'] ?? 'not_started',
        ];

        return \Inertia\Inertia::render('CEO/Review/PerformanceSystem', [
            'project' => $hrProject,
            'performanceSystem' => $hrProject->performanceSystem,
            'consultantRecommendation' => $consultantRecommendation,
            'algorithmRecommendations' => $algorithmRecommendations,
            'stepStatuses' => $mainStepStatuses,
            'snapshotQuestions' => $snapshotQuestions,
            'jobDefinitions' => $jobDefinitions,
            'orgChartMappings' => $orgChartMappings,
            'kpiReviewTokens' => $kpiReviewTokens,
        ]);
    }

    /**
     * Show compensation review page.
     */
    public function reviewCompensation(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        $hrProject->load(['compensationSystem', 'company']);

        $stepStatuses = $hrProject->step_statuses ?? [];
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'job_analysis' => $stepStatuses['job_analysis'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
            'hr_policy_os' => $stepStatuses['hr_policy_os'] ?? 'not_started',
        ];

        return \Inertia\Inertia::render('CEO/Review/Compensation', [
            'project' => $hrProject,
            'compensationSystem' => $hrProject->compensationSystem,
            'stepStatuses' => $mainStepStatuses,
        ]);
    }

    /**
     * Show job analysis review page - job list selection.
     */
    public function reviewJobListSelection(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        $hrProject->load(['diagnosis', 'company']);
        
        $diagnosis = $hrProject->diagnosis;
        $industry = $diagnosis->industry_category ?? null;
        $workforce = $diagnosis->present_headcount ?? 0;
        
        // Determine company size range
        $sizeRange = $this->determineSizeRange($workforce);

        // Get all job keywords (suggested jobs)
        $suggestedJobs = \App\Models\JobKeyword::where(function($query) use ($industry, $sizeRange) {
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

        // Get selected jobs (both finalized and non-finalized)
        $selectedJobs = \App\Models\JobDefinition::where('hr_project_id', $hrProject->id)
            ->with('jobKeyword')
            ->get();

        return \Inertia\Inertia::render('CEO/Review/JobListSelection', [
            'project' => $hrProject,
            'suggestedJobs' => $suggestedJobs,
            'selectedJobs' => $selectedJobs,
            'industry' => $industry,
            'sizeRange' => $sizeRange,
        ]);
    }

    /**
     * Show job analysis review page - job definitions.
     */
    public function reviewJobDefinitions(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        $hrProject->load(['diagnosis', 'company']);

        // Get all job definitions (both finalized and non-finalized)
        $jobDefinitions = \App\Models\JobDefinition::where('hr_project_id', $hrProject->id)
            ->with('jobKeyword')
            ->orderBy('job_name')
            ->get();

        $diagnosis = $hrProject->diagnosis;
        $industry = $diagnosis->industry_category ?? null;
        $workforce = $diagnosis->present_headcount ?? 0;
        $sizeRange = $this->determineSizeRange($workforce);

        return \Inertia\Inertia::render('CEO/Review/JobDefinitions', [
            'project' => $hrProject,
            'jobDefinitions' => $jobDefinitions,
            'industry' => $industry,
            'sizeRange' => $sizeRange,
        ]);
    }

    /**
     * Determine company size range based on workforce.
     */
    protected function determineSizeRange(int $workforce): string
    {
        if ($workforce < 50) {
            return 'small';
        } elseif ($workforce < 200) {
            return 'medium';
        } else {
            return 'large';
        }
    }
}
