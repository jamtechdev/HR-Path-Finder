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
     * Display a listing of companies for HR Manager.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Only HR Managers can view their companies list
        if (!$user->hasRole('hr_manager')) {
            abort(403);
        }
        
        // Get all companies where this HR Manager is a member
        $companies = Company::whereHas('users', function ($query) use ($user) {
            $query->where('users.id', $user->id)
                  ->where('company_users.role', 'hr_manager');
        })
        ->with([
            'users' => function ($query) {
                $query->wherePivot('role', 'ceo');
            },
            'hrProjects' => function ($query) {
                $query->where('status', 'active');
            }
        ])
        ->get()
        ->map(function ($company) {
            return [
                'id' => $company->id,
                'name' => $company->name,
                'registration_number' => $company->registration_number,
                'hq_location' => $company->hq_location,
                'public_listing_status' => $company->public_listing_status,
                'hasCeo' => $company->users->where('pivot.role', 'ceo')->isNotEmpty(),
                'ceo' => $company->users->where('pivot.role', 'ceo')->first(),
                'activeProject' => $company->hrProjects->first(),
                'created_at' => $company->created_at,
            ];
        });
        
        return Inertia::render('Companies/Index', [
            'companies' => $companies,
        ]);
    }

    /**
     * Show the form for creating a new company.
     */
    public function create(): Response
    {
        return Inertia::render('Companies/Create');
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
