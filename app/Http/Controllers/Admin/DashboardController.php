<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminComment;
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

        // Get projects needing recommendations
        $projectsNeedingPerformanceRecommendation = $projects->filter(function ($project) {
            $stepStatuses = $project->step_statuses ?? [];
            $jobAnalysisStatus = $stepStatuses['job_analysis'] ?? 'not_started';
            
            // Step 3 is confirmed but no performance recommendation exists
            if (in_array($jobAnalysisStatus, ['submitted', 'approved', 'locked'])) {
                $hasRecommendation = AdminComment::where('hr_project_id', $project->id)
                    ->where('is_recommendation', true)
                    ->where('recommendation_type', 'performance')
                    ->exists();
                return !$hasRecommendation;
            }
            return false;
        })->values();

        $projectsNeedingCompensationRecommendation = $projects->filter(function ($project) {
            $stepStatuses = $project->step_statuses ?? [];
            $performanceStatus = $stepStatuses['performance'] ?? 'not_started';
            
            // Step 4 is completed but no compensation recommendation exists
            if (in_array($performanceStatus, ['submitted', 'approved', 'locked'])) {
                $hasRecommendation = AdminComment::where('hr_project_id', $project->id)
                    ->where('is_recommendation', true)
                    ->where('recommendation_type', 'compensation')
                    ->exists();
                return !$hasRecommendation;
            }
            return false;
        })->values();

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
            'projectsNeedingPerformanceRecommendation' => $projectsNeedingPerformanceRecommendation,
            'projectsNeedingCompensationRecommendation' => $projectsNeedingCompensationRecommendation,
        ]);
    }

    /**
     * Show project tree view (Admin only).
     */
    public function projectTree(Request $request): Response
    {
        // Get all projects with their relationships
        $projects = HrProject::with([
            'company',
            'diagnosis',
            'ceoPhilosophy',
        ])->get();

        return Inertia::render('Admin/ProjectTree', [
            'projects' => $projects,
        ]);
    }
}
