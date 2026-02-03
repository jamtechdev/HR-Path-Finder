<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DiagnosisWizardController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $companyId = $request->query('company_id');

        $companiesQuery = $user->companies()->with([
            'businessProfile',
            'workforce',
            'currentHrStatus',
            'culture',
            'confidentialNote',
        ]);
        
        if ($companyId) {
            $companiesQuery->where('companies.id', $companyId);
        }

        $company = $companiesQuery->first();

        if (! $company) {
            return Inertia::render('companies/create');
        }

        $this->authorize('view', $company);

        // Get active tab from query parameter, default to 'overview'
        $activeTab = $request->query('tab', 'overview');
        
        // Validate tab parameter
        $validTabs = ['overview', 'company', 'business', 'workforce', 'current-hr', 'culture', 'confidential', 'review'];
        if (!in_array($activeTab, $validTabs)) {
            $activeTab = 'overview';
        }

        return Inertia::render('Diagnosis/Index', [
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'brand_name' => $company->brand_name,
                'foundation_date' => $company->foundation_date?->format('Y-m-d'),
                'hq_location' => $company->hq_location,
                'industry' => $company->industry,
                'secondary_industries' => $company->secondary_industries ?? [],
                'logo_path' => $company->logo_path ? Storage::url($company->logo_path) : null,
                'diagnosis_status' => $company->diagnosis_status,
                'business_profile' => $company->businessProfile ? [
                    'annual_revenue' => $company->businessProfile->annual_revenue,
                    'operational_margin_rate' => $company->businessProfile->operational_margin_rate,
                    'annual_human_cost' => $company->businessProfile->annual_human_cost,
                    'business_type' => $company->businessProfile->business_type,
                ] : null,
                'workforce' => $company->workforce ? [
                    'headcount_year_minus_2' => $company->workforce->headcount_year_minus_2,
                    'headcount_year_minus_1' => $company->workforce->headcount_year_minus_1,
                    'headcount_current' => $company->workforce->headcount_current,
                    'total_employees' => $company->workforce->total_employees,
                    'contract_employees' => $company->workforce->contract_employees,
                    'org_chart_path' => $company->workforce->org_chart_path,
                ] : null,
                'current_hr_status' => $company->currentHrStatus ? [
                    'dedicated_hr_team' => $company->currentHrStatus->dedicated_hr_team,
                    'labor_union_present' => $company->currentHrStatus->labor_union_present,
                    'labor_relations_stability' => $company->currentHrStatus->labor_relations_stability,
                    'evaluation_system_status' => $company->currentHrStatus->evaluation_system_status,
                    'compensation_system_status' => $company->currentHrStatus->compensation_system_status,
                    'evaluation_system_issues' => $company->currentHrStatus->evaluation_system_issues,
                    'job_rank_levels' => $company->currentHrStatus->job_rank_levels,
                    'job_title_levels' => $company->currentHrStatus->job_title_levels,
                ] : null,
                'culture' => $company->culture ? [
                    'work_format' => $company->culture->work_format,
                    'decision_making_style' => $company->culture->decision_making_style,
                    'core_values' => $company->culture->core_values ?? [],
                ] : null,
                'confidential_note' => $company->confidentialNote ? [
                    'notes' => $company->confidentialNote->notes,
                ] : null,
            ],
            'activeTab' => $activeTab,
        ]);
    }

    public function updateCompanyInfo(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'foundation_date' => 'required|date',
            'hq_location' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'secondary_industries' => 'nullable|array',
            'secondary_industries.*' => 'string|max:255',
            'logo' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:2048',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        DB::transaction(function () use ($company, $validated, $request) {
            $company->update([
                'name' => $validated['name'],
                'brand_name' => $validated['brand_name'] ?? null,
                'foundation_date' => $validated['foundation_date'],
                'hq_location' => $validated['hq_location'],
                'industry' => $validated['industry'],
                'secondary_industries' => $validated['secondary_industries'] ?? [],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
            ]);

            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('company-logos', 'public');
                $company->update(['logo_path' => $path]);
            }

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('company-images', 'public');
                $company->update(['image_path' => $path]);
            }

            // Mark diagnosis as in progress if not started
            if ($company->diagnosis_status === 'not_started') {
                $company->update(['diagnosis_status' => 'in_progress']);
            }
        });

        return redirect()->back()->with('success', 'Company information saved successfully.');
    }

    public function updateBusinessProfile(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'annual_revenue' => 'nullable|numeric|min:0',
            'operational_margin_rate' => 'nullable|numeric|min:0|max:100',
            'annual_human_cost' => 'nullable|numeric|min:0',
            'business_type' => 'nullable|in:b2b,b2c,b2b2c',
        ]);

        DB::transaction(function () use ($company, $validated) {
            $company->businessProfile()->updateOrCreate(
                ['company_id' => $company->id],
                $validated
            );

            // Mark diagnosis as in progress if not started
            if ($company->diagnosis_status === 'not_started') {
                $company->update(['diagnosis_status' => 'in_progress']);
            }
        });

        return redirect()->back()->with('success', 'Business profile saved successfully.');
    }

    public function updateWorkforce(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'headcount_year_minus_2' => 'nullable|integer|min:0',
            'headcount_year_minus_1' => 'nullable|integer|min:0',
            'headcount_current' => 'nullable|integer|min:0',
            'total_employees' => 'nullable|integer|min:0',
            'contract_employees' => 'nullable|integer|min:0',
            'org_chart' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        DB::transaction(function () use ($company, $validated, $request) {
            $data = $validated;
            
            if ($request->hasFile('org_chart')) {
                $path = $request->file('org_chart')->store('org-charts', 'public');
                $data['org_chart_path'] = $path;
                unset($data['org_chart']);
            }

            $company->workforce()->updateOrCreate(
                ['company_id' => $company->id],
                $data
            );

            // Mark diagnosis as in progress if not started
            if ($company->diagnosis_status === 'not_started') {
                $company->update(['diagnosis_status' => 'in_progress']);
            }
        });

        return redirect()->back()->with('success', 'Workforce information saved successfully.');
    }

    public function updateCurrentHr(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'dedicated_hr_team' => 'nullable|boolean',
            'labor_union_present' => 'nullable|boolean',
            'labor_relations_stability' => 'nullable|in:stable,moderate,unstable',
            'evaluation_system_status' => 'nullable|in:none,informal,basic,advanced',
            'compensation_system_status' => 'nullable|in:none,informal,basic,advanced',
            'evaluation_system_issues' => 'nullable|string|max:1000',
            'job_rank_levels' => 'nullable|integer|min:0',
            'job_title_levels' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($company, $validated) {
            $company->currentHrStatus()->updateOrCreate(
                ['company_id' => $company->id],
                $validated
            );

            // Mark diagnosis as in progress if not started
            if ($company->diagnosis_status === 'not_started') {
                $company->update(['diagnosis_status' => 'in_progress']);
            }
        });

        return redirect()->back()->with('success', 'Current HR status saved successfully.');
    }

    public function updateCulture(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'work_format' => 'nullable|in:on_site,hybrid,remote,flexible',
            'decision_making_style' => 'nullable|in:top_down,collaborative,consensus,decentralized',
            'core_values' => 'nullable|array|max:5',
            'core_values.*' => 'string|max:255',
        ]);

        DB::transaction(function () use ($company, $validated) {
            $company->culture()->updateOrCreate(
                ['company_id' => $company->id],
                $validated
            );

            // Mark diagnosis as in progress if not started
            if ($company->diagnosis_status === 'not_started') {
                $company->update(['diagnosis_status' => 'in_progress']);
            }
        });

        return redirect()->back()->with('success', 'Culture information saved successfully.');
    }

    public function updateConfidential(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'notes' => 'nullable|string|max:5000',
        ]);

        DB::transaction(function () use ($company, $validated) {
            $company->confidentialNote()->updateOrCreate(
                ['company_id' => $company->id],
                $validated
            );

            // Mark diagnosis as in progress if not started
            if ($company->diagnosis_status === 'not_started') {
                $company->update(['diagnosis_status' => 'in_progress']);
            }
        });

        return redirect()->back()->with('success', 'Confidential notes saved successfully.');
    }

    public function submit(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        // Validate all form data at once
        $validated = $request->validate([
            // Company Info
            'name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'foundation_date' => 'required|date',
            'hq_location' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'secondary_industries' => 'nullable|array',
            'secondary_industries.*' => 'string|max:255',
            'logo' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:2048',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            
            // Business Profile
            'annual_revenue' => 'required|numeric|min:0',
            'operational_margin_rate' => 'nullable|numeric|min:0|max:100',
            'annual_human_cost' => 'nullable|numeric|min:0',
            'business_type' => 'required|in:b2b,b2c,b2b2c',
            
            // Workforce
            'headcount_year_minus_2' => 'nullable|integer|min:0',
            'headcount_year_minus_1' => 'nullable|integer|min:0',
            'headcount_current' => 'nullable|integer|min:0',
            'total_employees' => 'required|integer|min:0',
            'contract_employees' => 'nullable|integer|min:0',
            'org_chart' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            
            // Current HR
            'dedicated_hr_team' => 'required|boolean',
            'labor_union_present' => 'nullable|boolean',
            'labor_relations_stability' => 'required|in:stable,moderate,unstable',
            'evaluation_system_status' => 'nullable|in:none,informal,basic,advanced',
            'compensation_system_status' => 'nullable|in:none,informal,basic,advanced',
            'evaluation_system_issues' => 'nullable|string|max:1000',
            'job_rank_levels' => 'nullable|integer|min:0',
            'job_title_levels' => 'nullable|integer|min:0',
            
            // Culture
            'work_format' => 'required|in:on_site,hybrid,remote,flexible',
            'decision_making_style' => 'required|in:top_down,collaborative,consensus,decentralized',
            'core_values' => 'required|array|min:1|max:5',
            'core_values.*' => 'string|max:255',
            
            // Confidential
            'notes' => 'nullable|string|max:5000',
        ]);

        DB::transaction(function () use ($company, $validated, $request) {
            // Save Company Info
            $company->update([
                'name' => $validated['name'],
                'brand_name' => $validated['brand_name'] ?? null,
                'foundation_date' => $validated['foundation_date'],
                'hq_location' => $validated['hq_location'],
                'industry' => $validated['industry'],
                'secondary_industries' => $validated['secondary_industries'] ?? [],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
            ]);

            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('company-logos', 'public');
                $company->update(['logo_path' => $path]);
            }

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('company-images', 'public');
                $company->update(['image_path' => $path]);
            }

            // Save Business Profile
            $company->businessProfile()->updateOrCreate(
                ['company_id' => $company->id],
                [
                    'annual_revenue' => $validated['annual_revenue'],
                    'operational_margin_rate' => $validated['operational_margin_rate'] ?? null,
                    'annual_human_cost' => $validated['annual_human_cost'] ?? null,
                    'business_type' => $validated['business_type'],
                ]
            );

            // Save Workforce
            $workforceData = [
                'headcount_year_minus_2' => $validated['headcount_year_minus_2'] ?? null,
                'headcount_year_minus_1' => $validated['headcount_year_minus_1'] ?? null,
                'headcount_current' => $validated['headcount_current'] ?? null,
                'total_employees' => $validated['total_employees'],
                'contract_employees' => $validated['contract_employees'] ?? null,
            ];
            
            if ($request->hasFile('org_chart')) {
                $path = $request->file('org_chart')->store('org-charts', 'public');
                $workforceData['org_chart_path'] = $path;
            }
            
            $company->workforce()->updateOrCreate(
                ['company_id' => $company->id],
                $workforceData
            );

            // Save Current HR
            $company->currentHrStatus()->updateOrCreate(
                ['company_id' => $company->id],
                [
                    'dedicated_hr_team' => $validated['dedicated_hr_team'],
                    'labor_union_present' => $validated['labor_union_present'] ?? null,
                    'labor_relations_stability' => $validated['labor_relations_stability'],
                    'evaluation_system_status' => $validated['evaluation_system_status'] ?? null,
                    'compensation_system_status' => $validated['compensation_system_status'] ?? null,
                    'evaluation_system_issues' => $validated['evaluation_system_issues'] ?? null,
                    'job_rank_levels' => $validated['job_rank_levels'] ?? null,
                    'job_title_levels' => $validated['job_title_levels'] ?? null,
                ]
            );

            // Save Culture
            $company->culture()->updateOrCreate(
                ['company_id' => $company->id],
                [
                    'work_format' => $validated['work_format'],
                    'decision_making_style' => $validated['decision_making_style'],
                    'core_values' => $validated['core_values'],
                ]
            );

            // Save Confidential Note (optional)
            if (!empty($validated['notes'])) {
                $company->confidentialNote()->updateOrCreate(
                    ['company_id' => $company->id],
                    ['notes' => $validated['notes']]
                );
            }

            // Mark diagnosis as completed
            $company->update([
                'diagnosis_status' => 'completed',
                'overall_status' => 'in_progress',
            ]);
        });

        return redirect()->route('dashboard')->with('success', 'Diagnosis completed successfully! You can now proceed to the next steps.');
    }
}
