<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\HrProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HrProjectController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $projects = HrProject::whereHas('company', function ($query) use ($user) {
            $query->whereHas('users', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        })->with('company')->get();

        return Inertia::render('hr-projects/index', [
            'projects' => $projects,
        ]);
    }

    public function show(HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);

        $hrProject->load([
            'company',
            'companyAttributes',
            'organizationalSentiment',
            'ceoPhilosophy',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'consultantReviews',
            'ceoApprovals',
        ]);

        return Inertia::render('hr-projects/show', [
            'project' => $hrProject,
        ]);
    }

    public function create(): Response
    {
        $companies = Auth::user()->companies;

        return Inertia::render('hr-projects/create', [
            'companies' => $companies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
        ]);

        $company = Company::findOrFail($validated['company_id']);
        $this->authorize('view', $company);

        $hrProject = $company->hrProjects()->create([
            'status' => 'not_started',
            'current_step' => 'diagnosis',
        ]);

        return redirect()->route('hr-projects.show', $hrProject->id);
    }
}
