<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\HrProject;
use App\Models\HrProjectAudit;
use App\Notifications\StepSubmittedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DiagnosisWizardController extends Controller
{
    /**
     * Get or create project for the user's company
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

        // Auto-create company if it doesn't exist (for HR Manager)
        if (! $company && $user->hasRole('hr_manager')) {
            $company = Company::create([
                'name' => $user->name . "'s Company",
                'industry' => 'General',
                'created_by' => $user->id,
            ]);
            
            // Attach HR Manager to company
            $company->users()->attach($user->id, ['role' => 'hr_manager']);
            
            // Reload company to ensure relationship is loaded
            $company->load('users');
        }

        if (! $company) {
            return ['company' => null, 'project' => null];
        }

        // Ensure users relationship is loaded for authorization check
        if (! $company->relationLoaded('users')) {
            $company->load('users');
        }

        // Check authorization
        $this->authorize('view', $company);

        $project = $projectId 
            ? $company->hrProjects()->findOrFail($projectId)
            : $company->hrProjects()->latest()->first();

        // Auto-create project if it doesn't exist
        if (! $project) {
            $project = $company->hrProjects()->create([
                'status' => 'not_started',
                'current_step' => 'diagnosis',
                'step_statuses' => [
                    'diagnosis' => 'not_started',
                    'organization' => 'not_started',
                    'performance' => 'not_started',
                    'compensation' => 'not_started',
                ],
            ]);
        }

        $project->load([
            'businessProfile',
            'workforce',
            'currentHrStatus',
            'culture',
            'confidentialNote',
        ]);

        return ['company' => $company, 'project' => $project];
    }

    /**
     * Overview page - shows when clicking Diagnosis from sidebar
     * Always shows Overview page, even if no company exists
     */
    public function overview(Request $request): Response|RedirectResponse
    {
        // Get or create company and project
        ['company' => $company, 'project' => $project] = $this->getProject($request);
        
        // Initialize step statuses if project exists
        if ($project) {
            $project->initializeStepStatuses();
        }

        // Get step statuses for the project
        $stepStatuses = [
            'diagnosis' => $project ? $project->getStepStatus('diagnosis') : 'not_started',
            'organization' => $project ? $project->getStepStatus('organization') : 'not_started',
            'performance' => $project ? $project->getStepStatus('performance') : 'not_started',
            'compensation' => $project ? $project->getStepStatus('compensation') : 'not_started',
        ];

        // Always show Overview page - no redirects
        return Inertia::render('Diagnosis/Overview', [
            'company' => $company,
            'project' => $project,
            'stepStatuses' => $stepStatuses,
        ]);
    }

    /**
     * Continue from Overview - sets step status to in_progress
     */
    public function continueStep(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('update', $hrProject->company);
        
        $hrProject->initializeStepStatuses();
        $hrProject->setStepStatus('diagnosis', 'in_progress');
        $this->markInProgress($hrProject);

        // Reload project data and render company-info page directly
        $hrProject->refresh();
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);
        
        // Automatically redirect to company-info page
        return Inertia::render('Diagnosis/CompanyInfo', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Company Info step
     */
    public function showCompanyInfo(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        $hrProject->load('company');
        
        return Inertia::render('Diagnosis/CompanyInfo', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Business Profile step
     */
    public function showBusinessProfile(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        // Load all relationships for real-time tab updates
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);
        
        return Inertia::render('Diagnosis/BusinessProfile', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Workforce step
     */
    public function showWorkforce(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        // Load all relationships for real-time tab updates
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);
        
        return Inertia::render('Diagnosis/Workforce', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Current HR step
     */
    public function showCurrentHr(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        // Load all relationships for real-time tab updates
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);
        
        return Inertia::render('Diagnosis/CurrentHr', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Culture step
     */
    public function showCulture(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        // Load all relationships for real-time tab updates
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);
        
        return Inertia::render('Diagnosis/Culture', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    /**
     * Show Confidential step
     */
    public function showConfidential(Request $request, HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);
        
        // Load all relationships for real-time tab updates
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);
        
        return Inertia::render('Diagnosis/Confidential', [
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
        
        $hrProject->load([
            'company',
            'businessProfile',
            'workforce',
            'currentHrStatus',
            'culture',
            'confidentialNote',
        ]);
        
        return Inertia::render('Diagnosis/Review', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    public function updateCompanyInfo(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $isCeo = Auth::user()->hasRole('ceo');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'foundation_date' => 'required|date',
            'hq_location' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'secondary_industries' => 'nullable|array',
            'secondary_industries.*' => 'string|max:255',
            'logo' => 'nullable|image|max:2048',
        ]);

        DB::transaction(function () use ($hrProject, $validated, $request, $isCeo) {
            $company = $hrProject->company;

            $company->update([
                'name' => $validated['name'],
                'brand_name' => $validated['brand_name'] ?? null,
                'foundation_date' => $validated['foundation_date'],
                'hq_location' => $validated['hq_location'],
                'industry' => $validated['industry'],
                'secondary_industries' => $validated['secondary_industries'] ?? [],
            ]);

            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('company-logos', 'public');
                $company->update(['logo_path' => $path]);
            }

            // Only mark in progress if HR Manager is updating (not CEO)
            // CEO can modify company info after diagnosis is submitted without changing step status
            if (!$isCeo) {
                $this->markInProgress($hrProject);
            }

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => $isCeo ? 'ceo_company_info_updated' : 'diagnosis_company_info_updated',
                'step' => $isCeo ? 'ceo_philosophy' : 'diagnosis',
                'new_data' => $validated,
            ]);
        });

        // Reload project with all relationships
        $hrProject->refresh();
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);

        // If CEO is updating, always redirect back to CEO Philosophy Survey
        if ($isCeo) {
            return redirect()->route('hr-projects.ceo-philosophy.show', $hrProject->id)
                ->with('success', 'Company information updated successfully. You can now continue with the Management Philosophy Survey.');
        }
        
        // Default: reload company info page (for HR Manager)
        return Inertia::render('Diagnosis/CompanyInfo', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    public function updateBusinessProfile(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $validated = $request->validate([
            'annual_revenue' => 'required|numeric|min:0',
            'operational_margin_rate' => 'required|numeric|min:0|max:100',
            'annual_human_cost' => 'required|numeric|min:0',
            'business_type' => 'required|in:b2b,b2c,b2b2c',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            $hrProject->businessProfile()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                $validated
            );

            $this->markInProgress($hrProject);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'diagnosis_business_profile_updated',
                'step' => 'diagnosis',
                'new_data' => $validated,
            ]);
        });

        // Reload project with all relationships for real-time tab updates
        $hrProject->refresh();
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);
        
        return Inertia::render('Diagnosis/Workforce', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    public function updateWorkforce(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $validated = $request->validate([
            'headcount_year_minus_2' => 'required|integer|min:0',
            'headcount_year_minus_1' => 'required|integer|min:0',
            'headcount_current' => 'required|integer|min:0',
            'total_employees' => 'required|integer|min:0',
            'contract_employees' => 'required|integer|min:0',
            'org_chart' => 'nullable|file|max:5120',
        ]);

        DB::transaction(function () use ($hrProject, $validated, $request) {
            $data = $validated;

            if ($request->hasFile('org_chart')) {
                $path = $request->file('org_chart')->store('workforce-org-charts', 'public');
                $data['org_chart_path'] = $path;
            }

            unset($data['org_chart']);

            $hrProject->workforce()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                $data
            );

            $this->markInProgress($hrProject);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'diagnosis_workforce_updated',
                'step' => 'diagnosis',
                'new_data' => $validated,
            ]);
        });

        // Reload project with all relationships for real-time tab updates
        $hrProject->refresh();
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);
        
        return Inertia::render('Diagnosis/CurrentHr', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    public function updateCurrentHr(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $validated = $request->validate([
            'dedicated_hr_team' => 'required|boolean',
            'labor_union_present' => 'required|boolean',
            'labor_relations_stability' => 'required|in:stable,moderate,unstable',
            'evaluation_system_status' => 'required|in:none,informal,basic,advanced',
            'compensation_system_status' => 'required|in:none,informal,basic,advanced',
            'evaluation_system_issues' => 'nullable|string',
            'job_rank_levels' => 'nullable|integer|min:0',
            'job_title_levels' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            $hrProject->currentHrStatus()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                $validated
            );

            $this->markInProgress($hrProject);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'diagnosis_current_hr_updated',
                'step' => 'diagnosis',
                'new_data' => $validated,
            ]);
        });

        // Reload project with all relationships for real-time tab updates
        $hrProject->refresh();
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);
        
        return Inertia::render('Diagnosis/Culture', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    public function updateCulture(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $validated = $request->validate([
            'work_format' => 'required|in:on_site,hybrid,remote,flexible',
            'decision_making_style' => 'required|in:top_down,collaborative,consensus,decentralized',
            'core_values' => 'required|array|min:1',
            'core_values.*' => 'string|max:255',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            $hrProject->culture()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                $validated
            );

            $this->markInProgress($hrProject);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'diagnosis_culture_updated',
                'step' => 'diagnosis',
                'new_data' => $validated,
            ]);
        });

        // Reload project with all relationships for real-time tab updates
        $hrProject->refresh();
        $hrProject->load(['company', 'businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote']);
        
        // Redirect to Review page after confidential notes are saved
        return Inertia::render('Diagnosis/Review', [
            'company' => $hrProject->company,
            'project' => $hrProject,
        ]);
    }

    public function updateConfidential(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            $hrProject->confidentialNote()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                $validated
            );

            $this->markInProgress($hrProject);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'diagnosis_confidential_updated',
                'step' => 'diagnosis',
                'new_data' => $validated,
            ]);
        });

        return redirect()->back();
    }

    public function submit(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

        $hrProject->load([
            'businessProfile',
            'workforce',
            'currentHrStatus',
            'culture',
            'confidentialNote',
        ]);

        $company = $hrProject->company;

        $missing = [];

        if (! $company->name || ! $company->foundation_date || ! $company->hq_location || ! $company->industry) {
            $missing[] = 'Company Info';
        }

        if (! $hrProject->businessProfile) {
            $missing[] = 'Business Profile';
        }

        if (! $hrProject->workforce) {
            $missing[] = 'Workforce';
        }

        if (! $hrProject->currentHrStatus) {
            $missing[] = 'Current HR';
        }

        if (! $hrProject->culture || empty($hrProject->culture->core_values)) {
            $missing[] = 'Culture';
        }

        if ($missing) {
            return redirect()->back()->withErrors([
                'diagnosis' => 'Please complete: '.implode(', ', $missing).'.',
            ]);
        }

        $this->markInProgress($hrProject);

        // Set diagnosis step status to submitted
        $hrProject->initializeStepStatuses();
        $hrProject->setStepStatus('diagnosis', 'submitted');
        
        $hrProject->update([
            'current_step' => 'organization',
        ]);

        HrProjectAudit::create([
            'hr_project_id' => $hrProject->id,
            'user_id' => Auth::id(),
            'action' => 'diagnosis_submitted',
            'step' => 'diagnosis',
        ]);

        // Get or attach CEO to company, then send notification
        $ceo = $hrProject->getCeoUser();
        
        // If no CEO is attached, try to find a CEO user and attach them
        if (!$ceo) {
            // Find any CEO user in the system
            $ceoUser = \App\Models\User::whereHas('roles', function($query) {
                $query->where('name', 'ceo');
            })->first();
            
            if ($ceoUser) {
                // Attach CEO to company if not already attached
                $company = $hrProject->company;
                if (!$company->users()->where('users.id', $ceoUser->id)->exists()) {
                    $company->users()->attach($ceoUser->id, ['role' => 'ceo']);
                    \Log::info('CEO attached to company', [
                        'ceo_id' => $ceoUser->id,
                        'company_id' => $company->id,
                        'project_id' => $hrProject->id,
                    ]);
                }
                $ceo = $ceoUser;
            }
        }
        
        // Send email notification to CEO
        if ($ceo) {
            try {
                $ceo->notify(new StepSubmittedNotification($hrProject, 'diagnosis'));
            } catch (\Exception $e) {
                // Log error but don't fail the submission
                \Log::error('Failed to send CEO notification: ' . $e->getMessage());
            }
        }

        // Reload project data with all relationships
        $hrProject->refresh();
        $hrProject->load([
            'company',
            'businessProfile',
            'workforce',
            'currentHrStatus',
            'culture',
            'confidentialNote',
        ]);
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

        // Redirect to dashboard with success message (using Inertia to avoid page refresh)
        return Inertia::render('Dashboard/HRManager/Index', [
            'project' => $hrProject,
            'stepStatuses' => $stepStatuses,
            'progressCount' => $progressCount,
            'currentStepNumber' => $currentStepNumber,
        ])->with('success', 'Diagnosis – Step 1 has been submitted successfully! An email notification has been sent to the CEO for verification. Step 2 will unlock automatically once the CEO completes the Management Philosophy Survey.');
    }

    private function markInProgress(HrProject $hrProject): void
    {
        if ($hrProject->status === 'not_started') {
            $hrProject->update([
                'status' => 'in_progress',
                'current_step' => $hrProject->current_step ?? 'diagnosis',
            ]);
        }
    }
}
