<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        
        // Filter companies based on user role
        // CEO: Only show companies where they are attached (accepted invitation)
        // HR Manager: Show companies they created or are attached to
        if ($user->hasRole('ceo')) {
            $companies = $user->companies()
                ->wherePivot('role', 'ceo') // Only companies where CEO accepted invitation
                ->with(['users', 'hrProjects'])
                ->get();
        } else {
            // HR Manager or other roles
            $companies = $user->companies()
                ->with(['users', 'invitations' => function ($query) {
                    $query->whereNull('accepted_at')
                        ->whereNull('rejected_at')
                        ->where(function ($q) {
                            $q->whereNull('expires_at')
                                ->orWhere('expires_at', '>', now());
                        });
                }])
                ->get();
        }
        
        $companies = $companies->map(function ($company) {
            return [
                'id' => $company->id,
                'name' => $company->name,
                'brand_name' => $company->brand_name,
                'industry' => $company->industry,
                'logo_path' => $company->logo_path ? asset('storage/' . $company->logo_path) : null,
                'image_path' => $company->image_path ? asset('storage/' . $company->image_path) : null,
                'created_by' => $company->created_by,
                'users' => $company->users,
                'invitations' => $company->invitations ?? [],
                'diagnosis_status' => $company->diagnosis_status,
                'overall_status' => $company->overall_status,
                'hr_projects' => $company->hrProjects ?? [],
            ];
        });

        return Inertia::render('companies/index', [
            'companies' => $companies,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Company::class);

        $user = Auth::user();
        
        // Check if user has an existing company
        $company = $user->companies()
            ->with(['businessProfile', 'workforce', 'currentHrStatus', 'culture', 'confidentialNote'])
            ->first();

        return Inertia::render('companies/create', [
            'company' => $company ? [
                'id' => $company->id,
                'name' => $company->name,
                'brand_name' => $company->brand_name,
                'foundation_date' => $company->foundation_date?->format('Y-m-d'),
                'hq_location' => $company->hq_location,
                'industry' => $company->industry,
                'secondary_industries' => $company->secondary_industries ?? [],
                'latitude' => $company->latitude,
                'longitude' => $company->longitude,
                'logo_path' => $company->logo_path ? asset('storage/' . $company->logo_path) : null,
                'image_path' => $company->image_path ? asset('storage/' . $company->image_path) : null,
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
            ] : null,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Company::class);
        
        // Check if user email is verified
        $user = Auth::user();
        if (!$user->hasVerifiedEmail()) {
            return back()->withErrors(['email' => 'Please verify your email address before creating a company.'])
                ->withInput();
        }
        
        // Check SMTP configuration before allowing company creation
        if (!\App\Services\SmtpConfigurationService::isConfigured()) {
            return back()->withErrors(['smtp' => 'SMTP is not configured. Please configure email settings before creating a company.'])
                ->withInput();
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'foundation_date' => 'required|date',
            'hq_location' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'secondary_industries' => 'nullable|array',
            'secondary_industries.*' => 'string|max:255',
            'size' => 'nullable|string|max:255',
            'growth_stage' => 'nullable|in:early,growth,maturity,decline',
            'logo' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:2048',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $company = Company::create([
            'name' => $validated['name'],
            'brand_name' => $validated['brand_name'] ?? null,
            'foundation_date' => $validated['foundation_date'],
            'hq_location' => $validated['hq_location'],
            'industry' => $validated['industry'],
            'secondary_industries' => $validated['secondary_industries'] ?? [],
            'size' => $validated['size'] ?? null,
            'growth_stage' => $validated['growth_stage'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'created_by' => Auth::id(),
        ]);

        // Attach user to company
        $company->users()->attach(Auth::id(), ['role' => 'hr_manager']);

        // Set initial diagnosis status
        $company->update(['diagnosis_status' => 'not_started']);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('company-logos', 'public');
            $company->update(['logo_path' => $path]);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('company-images', 'public');
            $company->update(['image_path' => $path]);
        }

        // If step_wise parameter is set, return back to continue the form
        // The frontend will reload the page to get updated data
        if ($request->has('step_wise') && $request->boolean('step_wise')) {
            return back()->with('success', 'Company information saved successfully.');
        }

        // Redirect to HR Manager dashboard after company creation
        return redirect()->route('dashboard.hr-manager')
            ->with('success', 'Company created successfully! You can now start the diagnosis process.');
    }

    public function show(Company $company): Response
    {
        $this->authorize('view', $company);

        $company->load(['users', 'invitations' => function ($query) {
            $query->whereNull('accepted_at')
                ->whereNull('rejected_at')
                ->where(function ($q) {
                    $q->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->latest();
        }]);

        $user = Auth::user();
        $canInvite = $user->hasRole('hr_manager') && $company->created_by === $user->id;

        // Load HR projects for the company
        $company->load('hrProjects');

        return Inertia::render('companies/show', [
            'company' => $company,
            'canInvite' => $canInvite,
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'foundation_date' => 'nullable|date',
            'hq_location' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'secondary_industries' => 'nullable|array',
            'secondary_industries.*' => 'string|max:255',
            'size' => 'nullable|string|max:255',
            'growth_stage' => 'nullable|in:early,growth,maturity,decline',
            'logo' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:2048',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $updateData = $validated;
        unset($updateData['logo'], $updateData['image']);
        $company->update($updateData);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('company-logos', 'public');
            $company->update(['logo_path' => $path]);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('company-images', 'public');
            $company->update(['image_path' => $path]);
        }

        return redirect()->route('companies.show', $company->id);
    }
}
