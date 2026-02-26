<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\CeoReviewLog;
use App\Models\HrProject;
use App\Services\AuditLogService;
use App\Services\DiagnosisSnapshotService;
use App\Services\StepTransitionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $hrProject->load(['diagnosis', 'company']);
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
        
        if (!$diagnosis || $diagnosis->status !== StepStatus::SUBMITTED) {
            return back()->withErrors(['error' => 'Diagnosis must be submitted before review.']);
        }

        // Validate the request data
        $validated = $request->validate([
            'is_public' => ['nullable', 'boolean'],
            'registration_number' => ['nullable', 'string', 'max:255'],
            'hq_location' => ['nullable', 'string', 'max:255'],
            'industry_category' => ['nullable', 'string', 'max:255'],
            'industry_subcategory' => ['nullable', 'string', 'max:255'],
            'industry_other' => ['nullable', 'string', 'max:255'],
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
            // Update company's is_public field if provided
            if (isset($data['is_public'])) {
                $companyOriginalValue = $hrProject->company->is_public ? 'true' : 'false';
                $companyNewValue = $data['is_public'] ? 'true' : 'false';
                
                if ($companyOriginalValue != $companyNewValue) {
                    CeoReviewLog::create([
                        'hr_project_id' => $hrProject->id,
                        'field_name' => 'company.is_public',
                        'field_type' => 'company',
                        'original_value' => $companyOriginalValue,
                        'modified_value' => $companyNewValue,
                        'modified_by' => $request->user()->id,
                    ]);
                }
                
                $hrProject->company->update(['is_public' => $data['is_public']]);
                unset($data['is_public']); // Remove from diagnosis data
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

        return back()->with('success', 'Changes saved successfully. All modifications have been logged.');
    }

    /**
     * Confirm and approve diagnosis.
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

        // Create snapshot
        $this->snapshotService->createSnapshot($hrProject);

        // Approve and lock diagnosis step (this will unlock organization design)
        $this->stepTransitionService->approveAndLockStep($hrProject, 'diagnosis');

        return redirect()->route('ceo.philosophy.survey', $hrProject)
            ->with('success', 'Diagnosis confirmed and locked. Please complete the Management Philosophy Survey.');
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

        if (!$currentStatus || $currentStatus !== StepStatus::SUBMITTED) {
            return back()->withErrors(['error' => "Step {$step} must be submitted before verification."]);
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
