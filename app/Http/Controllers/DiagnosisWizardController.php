<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\HrProjectAudit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DiagnosisWizardController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $companyId = $request->query('company_id');

        $companiesQuery = $user->companies()->with('hrProjects');
        if ($companyId) {
            $companiesQuery->where('companies.id', $companyId);
        }

        $company = $companiesQuery->first();

        if (! $company) {
            return Inertia::render('companies/create');
        }

        $this->authorize('view', $company);

        $project = $company->hrProjects()->latest()->first();

        if (! $project) {
            $project = $company->hrProjects()->create([
                'status' => 'not_started',
                'current_step' => 'diagnosis',
            ]);
        }

        $project->load([
            'businessProfile',
            'workforce',
            'currentHrStatus',
            'culture',
            'confidentialNote',
        ]);

        return Inertia::render('Diagnosis/Index', [
            'company' => $company,
            'project' => $project,
        ]);
    }

    public function updateCompanyInfo(Request $request, HrProject $hrProject)
    {
        $this->authorize('update', $hrProject->company);

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

        DB::transaction(function () use ($hrProject, $validated, $request) {
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

            $this->markInProgress($hrProject);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'diagnosis_company_info_updated',
                'step' => 'diagnosis',
                'new_data' => $validated,
            ]);
        });

        return redirect()->back();
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

        return redirect()->back();
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

        return redirect()->back();
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
            'job_rank_levels' => 'required|integer|min:0',
            'job_title_levels' => 'required|integer|min:0',
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

        return redirect()->back();
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

        return redirect()->back();
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

        $hrProject->update([
            'current_step' => 'organization',
        ]);

        HrProjectAudit::create([
            'hr_project_id' => $hrProject->id,
            'user_id' => Auth::id(),
            'action' => 'diagnosis_submitted',
            'step' => 'diagnosis',
        ]);

        return redirect()->back()->with('success', 'Diagnosis submitted successfully.');
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
