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

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'growth_stage' => 'nullable|in:early,growth,maturity,decline',
            'logo' => 'nullable|image|max:2048',
        ]);

        $company = Company::create([
            'name' => $validated['name'],
            'industry' => $validated['industry'] ?? null,
            'size' => $validated['size'] ?? null,
            'growth_stage' => $validated['growth_stage'] ?? null,
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

        return redirect()->route('hr-projects.show', $hrProject->id);
    }

    public function show(Company $company): Response
    {
        $this->authorize('view', $company);

        $company->load(['hrProjects', 'users']);

        return Inertia::render('companies/show', [
            'company' => $company,
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'growth_stage' => 'nullable|in:early,growth,maturity,decline',
            'logo' => 'nullable|image|max:2048',
        ]);

        $company->update($validated);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('company-logos', 'public');
            $company->update(['logo_path' => $path]);
        }

        return redirect()->route('companies.show', $company->id);
    }
}
