<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Get all projects (admin can see all)
        $projects = HrProject::with(['company', 'diagnosis', 'organizationDesign', 'performanceSystem', 'compensationSystem', 'ceoPhilosophy'])->get();

        // Calculate statistics
        $totalProjects = $projects->count();
        $totalCompanies = \App\Models\Company::count();
        $activeProjects = $projects->filter(function ($project) {
            return !$project->isFullyLocked();
        })->count();
        
        $completedProjects = $projects->filter(function ($project) {
            return $project->isFullyLocked();
        })->count();

        $pendingDiagnosis = $projects->filter(function ($project) {
            $status = $project->getStepStatus('diagnosis');
            return $status && $status->value === 'submitted';
        })->count();

        $pendingCeoSurvey = $projects->filter(function ($project) {
            $diagnosisStatus = $project->getStepStatus('diagnosis');
            return $diagnosisStatus && $diagnosisStatus->value === 'submitted' && !$project->ceoPhilosophy;
        })->count();

        // Get recent projects
        $recentProjects = $projects->sortByDesc('created_at')->take(5)->values();

        return Inertia::render('Dashboard/Admin/Index', [
            'projects' => $projects,
            'stats' => [
                'total_projects' => $totalProjects,
                'total_companies' => $totalCompanies,
                'active_projects' => $activeProjects,
                'completed_projects' => $completedProjects,
                'pending_diagnosis' => $pendingDiagnosis,
                'pending_ceo_survey' => $pendingCeoSurvey,
            ],
            'recentProjects' => $recentProjects,
        ]);
    }
}
