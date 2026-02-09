<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\HrProject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HrProjectController extends Controller
{
    /**
     * Display a listing of HR projects.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        if ($user->hasRole('hr_manager')) {
            $projects = HrProject::whereHas('company', function ($query) use ($user) {
                $query->whereHas('users', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                });
            })->with(['company', 'diagnosis'])->get();
        } elseif ($user->hasRole('ceo')) {
            $projects = HrProject::whereHas('company', function ($query) use ($user) {
                $query->whereHas('users', function ($q) use ($user) {
                    $q->where('users.id', $user->id)
                      ->where('company_users.role', 'ceo');
                });
            })->with(['company', 'diagnosis'])->get();
        } elseif ($user->hasRole('admin')) {
            $projects = HrProject::with(['company', 'diagnosis'])->get();
        } else {
            $projects = collect();
        }

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Display the specified HR project.
     */
    public function show(Request $request, HrProject $hrProject)
    {
        // Authorization check
        $company = $hrProject->company;
        if (!$company->users->contains($request->user()) && !$request->user()->hasRole('admin')) {
            abort(403);
        }

        $hrProject->load([
            'company',
            'diagnosis',
            'ceoPhilosophy',
            'companyAttributes',
            'organizationalSentiment',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
        ]);

        return Inertia::render('Projects/Show', [
            'project' => $hrProject,
        ]);
    }
}
