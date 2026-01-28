<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HrSystemOutputController extends Controller
{
    /**
     * Display HR System Output overview
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        $company = $user->companies()->with(['hrProjects' => function ($query) {
            $query->latest()->first();
        }])->first();

        if (! $company) {
            return Inertia::render('HrSystemOutput/Index', [
                'company' => null,
                'project' => null,
            ]);
        }

        $project = $company->hrProjects()->latest()->first();

        if ($project) {
            $project->load([
                'company',
                'organizationDesign',
                'performanceSystem',
                'compensationSystem',
                'ceoPhilosophy',
                'culture',
            ]);
        }

        return Inertia::render('HrSystemOutput/Index', [
            'company' => $company,
            'project' => $project,
        ]);
    }
}
