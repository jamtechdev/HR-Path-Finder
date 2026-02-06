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
        
        // Get all active HR projects (not completed)
        $allProjects = HrProject::with([
            'company',
            'ceoPhilosophy',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
        ])->get();
        
        // Get active companies (companies with HR projects)
        $activeCompanies = $allProjects->map(function($project) {
            $project->initializeStepStatuses();
            return [
                'id' => $project->company->id,
                'name' => $project->company->name,
                'industry' => $project->company->industry,
                'project_id' => $project->id,
                'step_statuses' => [
                    'diagnosis' => $project->getStepStatus('diagnosis'),
                    'organization' => $project->getStepStatus('organization'),
                    'performance' => $project->getStepStatus('performance'),
                    'compensation' => $project->getStepStatus('compensation'),
                ],
            ];
        })->unique('id')->values();
        
        // Get projects with all steps complete (ready for review)
        $projectsWithSteps = $allProjects->map(function($project) {
            $project->initializeStepStatuses();
            $stepStatuses = [
                'diagnosis' => $project->getStepStatus('diagnosis'),
                'organization' => $project->getStepStatus('organization'),
                'performance' => $project->getStepStatus('performance'),
                'compensation' => $project->getStepStatus('compensation'),
            ];
            
            $allStepsComplete = collect($stepStatuses)->every(fn($status) => 
                in_array($status, ['submitted', 'completed'])
            );
            
            return [
                'id' => $project->id,
                'company_id' => $project->company_id,
                'company_name' => $project->company->name,
                'company_industry' => $project->company->industry,
                'step_statuses' => $stepStatuses,
                'all_steps_complete' => $allStepsComplete,
                'ceo_philosophy_completed' => $project->ceoPhilosophy && $project->ceoPhilosophy->completed_at,
            ];
        });
        
        // Get workflow status (count of submitted steps across all projects)
        $workflowStatus = [
            'step1' => $allProjects->filter(fn($p) => 
                in_array($p->getStepStatus('diagnosis'), ['submitted', 'completed'])
            )->count(),
            'step2' => $allProjects->filter(fn($p) => 
                in_array($p->getStepStatus('organization'), ['submitted', 'completed'])
            )->count(),
            'step3' => $allProjects->filter(fn($p) => 
                in_array($p->getStepStatus('performance'), ['submitted', 'completed'])
            )->count(),
            'step4' => $allProjects->filter(fn($p) => 
                in_array($p->getStepStatus('compensation'), ['submitted', 'completed'])
            )->count(),
        ];
        
        // Get projects that need review (all steps complete)
        $needsReview = $projectsWithSteps->filter(fn($p) => $p['all_steps_complete'])->values();
        
        // Get projects assigned for consultant review
        $assignedProjects = HrProject::where('status', 'pending_consultant_review')
            ->with(['company', 'consultantReview'])
            ->get();
            
        // Get completed reviews by this consultant
        $completedReviews = ConsultantReview::where('consultant_id', $user->id)
            ->with(['hrProject.company'])
            ->latest()
            ->take(5)
            ->get();
        
        // Calculate stats
        $totalStepsComplete = $projectsWithSteps->filter(fn($p) => $p['all_steps_complete'])->count();
        $totalSteps = $projectsWithSteps->count();
        $ceoSurveyStatus = $projectsWithSteps->filter(fn($p) => $p['ceo_philosophy_completed'])->count();
        $finalStatus = $assignedProjects->count() > 0 ? 'pending' : 'none';

        return Inertia::render('Dashboard/Consultant/Index', [
            'allCompanies' => $allProjects->pluck('company')->unique('id')->values(),
            'activeCompanies' => $activeCompanies,
            'projectsWithSteps' => $projectsWithSteps,
            'needsReview' => $needsReview,
            'assignedProjects' => $assignedProjects,
            'completedReviews' => $completedReviews,
            'workflowStatus' => $workflowStatus,
            'stats' => [
                'active_companies' => $activeCompanies->count(),
                'steps_complete' => $totalStepsComplete . '/' . $totalSteps,
                'ceo_survey_status' => $ceoSurveyStatus > 0 ? 'submitted' : 'pending',
                'final_status' => $finalStatus,
                'pending_reviews' => $assignedProjects->count(),
                'completed_reviews' => $completedReviews->count(),
            ]
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