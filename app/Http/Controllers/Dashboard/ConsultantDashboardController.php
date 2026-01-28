<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use App\Models\ConsultantReview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultantDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get all companies with HR projects
        $companies = \App\Models\Company::with(['hrProjects' => function ($query) {
            $query->latest();
        }])->get();

        // Get ALL projects (not just submitted ones) for comprehensive view
        $allProjects = HrProject::with([
                'company' => function($query) {
                    $query->with(['users' => function($q) {
                        $q->wherePivot('role', 'hr_manager');
                    }]);
                },
                'ceoPhilosophy',
                'organizationDesign',
                'performanceSystem',
                'compensationSystem',
                'businessProfile',
                'workforce',
                'currentHrStatus',
                'culture',
                'consultantReviews' => function($query) use ($user) {
                    $query->where('consultant_id', $user->id);
                }
            ])
            ->latest()
            ->get();

        // Get active projects (submitted and ready for review)
        $activeProjects = $allProjects->filter(function($project) {
            return in_array($project->status, ['submitted', 'pending_consultant_review', 'in_progress']);
        });

        // Count steps complete for each project with detailed status
        $projectsWithSteps = $allProjects->map(function ($project) {
            $project->initializeStepStatuses();
            $project->refresh();
            
            $stepStatuses = [
                'diagnosis' => $project->getStepStatus('diagnosis'),
                'organization' => $project->getStepStatus('organization'),
                'performance' => $project->getStepStatus('performance'),
                'compensation' => $project->getStepStatus('compensation'),
            ];
            
            $stepsComplete = collect($stepStatuses)->filter(fn($status) => $status === 'submitted')->count();
            $totalSteps = 4;
            $progressPercentage = ($stepsComplete / $totalSteps) * 100;
            
            // Get HR Manager info
            $hrManager = $project->company->users->first();
            
            // Check if reviewed by this consultant
            $hasReview = $project->consultantReviews->isNotEmpty();
            $latestReview = $project->consultantReviews->first();

            return [
                'project' => $project,
                'stepsComplete' => $stepsComplete,
                'totalSteps' => $totalSteps,
                'progressPercentage' => $progressPercentage,
                'stepStatuses' => $stepStatuses,
                'hr_manager_name' => $hrManager?->name,
                'hr_manager_email' => $hrManager?->email,
                'has_review' => $hasReview,
                'latest_review_date' => $latestReview?->created_at,
            ];
        });

        // Get completed reviews
        $completedReviews = ConsultantReview::where('consultant_id', $user->id)
            ->with(['hrProject.company'])
            ->latest()
            ->get();

        // Calculate comprehensive stats
        $totalCompanies = $allProjects->pluck('company_id')->unique()->count();
        $activeCompanyCount = $activeProjects->pluck('company_id')->unique()->count();
        $allStepsCompleteCount = $projectsWithSteps->filter(fn($p) => $p['stepsComplete'] === $p['totalSteps'])->count();
        $ceoSurveySubmitted = $allProjects->filter(fn($p) => $p->ceoPhilosophy && $p->ceoPhilosophy->completed_at)->count();
        $pendingReviewCount = $allProjects->filter(fn($p) => 
            $p->status === 'submitted' || $p->status === 'pending_consultant_review'
        )->count();
        $reviewedCount = $projectsWithSteps->filter(fn($p) => $p['has_review'])->count();
        
        // Get projects needing review (submitted but not reviewed)
        $needsReview = $allProjects->filter(function($project) use ($user) {
            $hasReview = $project->consultantReviews()->where('consultant_id', $user->id)->exists();
            return ($project->status === 'submitted' || $project->status === 'pending_consultant_review') && !$hasReview;
        });

        return Inertia::render('Consultant/Dashboard/Index', [
            'allCompanies' => $allProjects->pluck('company')->unique('id')->values(),
            'activeCompanies' => $activeProjects->pluck('company')->unique('id')->values(),
            'projectsWithSteps' => $projectsWithSteps,
            'needsReview' => $needsReview->map(function($project) {
                return [
                    'id' => $project->id,
                    'company_name' => $project->company->name,
                    'status' => $project->status,
                ];
            })->values(),
            'stats' => [
                'total_companies' => $totalCompanies,
                'active_companies' => $activeCompanyCount,
                'steps_complete' => $allStepsCompleteCount,
                'total_steps' => 4,
                'ceo_survey_submitted' => $ceoSurveySubmitted,
                'pending_review' => $pendingReviewCount,
                'reviewed' => $reviewedCount,
                'total_projects' => $allProjects->count(),
            ],
            'workflowStatus' => [
                'diagnosis' => $allProjects->filter(fn($p) => $p->getStepStatus('diagnosis') === 'submitted')->count(),
                'organization' => $allProjects->filter(fn($p) => $p->getStepStatus('organization') === 'submitted')->count(),
                'performance' => $allProjects->filter(fn($p) => $p->getStepStatus('performance') === 'submitted')->count(),
                'compensation' => $allProjects->filter(fn($p) => $p->getStepStatus('compensation') === 'submitted')->count(),
            ],
        ]);
    }

    public function reviews()
    {
        $user = auth()->user();
        
        $pendingReviews = HrProject::where('status', 'pending_consultant_review')
            ->with(['company', 'ceoPhilosophy', 'organizationDesign', 'performanceSystem', 'compensationSystem'])
            ->paginate(10);

        return Inertia::render('Dashboard/Consultant/Reviews', [
            'pendingReviews' => $pendingReviews
        ]);
    }
}