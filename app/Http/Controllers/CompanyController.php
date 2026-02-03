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
        $companies = $user->companies()->with('hrProjects')->get();

        return Inertia::render('companies/index', [
            'companies' => $companies,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Company::class);

        return Inertia::render('companies/create');
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

        // Create initial HR project
        $hrProject = $company->hrProjects()->create([
            'status' => 'not_started',
            'current_step' => 'diagnosis',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('company-logos', 'public');
            $company->update(['logo_path' => $path]);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('company-images', 'public');
            $company->update(['image_path' => $path]);
        }

        // Redirect to company show page so HR Manager can invite CEO
        return redirect()->route('companies.show', $company->id)
            ->with('success', 'Company created successfully! Please invite the CEO to join the workspace.');
    }

    public function show(Company $company): Response
    {
        $this->authorize('view', $company);

        $company->load(['hrProjects', 'users', 'invitations' => function ($query) {
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
