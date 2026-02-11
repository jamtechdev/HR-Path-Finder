<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompanyRequest;
use App\Models\Company;
use App\Services\CompanyWorkspaceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function __construct(
        protected CompanyWorkspaceService $workspaceService
    ) {
    }

    /**
     * Show the form for creating a new company.
     */
    public function create(): Response
    {
        return Inertia::render('companies.create');
    }

    /**
     * Store a newly created company.
     */
    public function store(StoreCompanyRequest $request)
    {
        $data = $request->validated();
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('company-logos', 'public');
        }

        $company = $this->workspaceService->create($data, $request->user());

        return redirect()->route('hr-manager.dashboard')
            ->with('success', 'Company created successfully. You can now start the diagnosis process.');
    }

    /**
     * Display the specified company.
     */
    public function show(Request $request, Company $company)
    {
        $company->load(['hrProjects', 'users']);
        
        // Check authorization
        if (!$company->users->contains($request->user()) && !$request->user()->hasRole(['consultant', 'admin'])) {
            abort(403);
        }

        return Inertia::render('Companies/Show', [
            'company' => $company,
        ]);
    }
}
