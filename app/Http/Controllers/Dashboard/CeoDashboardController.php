<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CeoDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get companies where user is CEO
        $companies = $user->companies()->wherePivot('role', 'ceo')->get();
        
        // Also find projects from companies where diagnosis is submitted (in case CEO is not yet attached)
        // This ensures CEO can see projects even if not explicitly attached yet
        $companyIds = $companies->pluck('id')->toArray();
        
        // Also find projects with submitted diagnosis where CEO might not be attached yet
        // Auto-attach CEO to these companies
        $projectsNeedingCeo = HrProject::whereHas('company', function($query) {
            $query->whereDoesntHave('users', function($q) {
                $q->where('users.id', auth()->id())
                  ->where('company_users.role', 'ceo');
            });
        })
        ->get()
        ->filter(function($project) {
            $project->initializeStepStatuses();
            $project->refresh();
            return $project->getStepStatus('diagnosis') === 'submitted';
        });
        
        foreach ($projectsNeedingCeo as $project) {
            $project->company->users()->syncWithoutDetaching([
                $user->id => ['role' => 'ceo']
            ]);
            if (!in_array($project->company_id, $companyIds)) {
                $companyIds[] = $project->company_id;
            }
        }
        
        // Reload companies after auto-attachment
        $companies = $user->companies()->wherePivot('role', 'ceo')->get();
        
        // Get latest HR project for the company
        // Prioritize projects with submitted diagnosis that need CEO survey
        $latestProject = null;
        if (!empty($companyIds)) {
            // First try to find project with submitted diagnosis that needs CEO survey
            $latestProject = HrProject::whereIn('company_id', $companyIds)
                ->with([
                    'company',
                    'ceoPhilosophy',
                    'organizationDesign',
                    'performanceSystem',
                    'compensationSystem',
                    'businessProfile',
                    'workforce',
                    'currentHrStatus',
                    'culture',
                    'confidentialNote',
                ])
                ->get()
                ->filter(function($project) {
                    $project->initializeStepStatuses();
                    $project->refresh();
                    $diagnosisStatus = $project->getStepStatus('diagnosis');
                    $hasCeoPhilosophy = $project->ceoPhilosophy && $project->ceoPhilosophy->completed_at;
                    // Prioritize projects with submitted diagnosis but no completed CEO philosophy
                    return $diagnosisStatus === 'submitted' && !$hasCeoPhilosophy;
                })
                ->sortByDesc('updated_at')
                ->first();
            
            // If no project needs survey, get the latest project
            if (!$latestProject) {
                $latestProject = HrProject::whereIn('company_id', $companyIds)
                    ->with([
                        'company',
                        'ceoPhilosophy',
                        'organizationDesign',
                        'performanceSystem',
                        'compensationSystem',
                        'businessProfile',
                        'workforce',
                        'currentHrStatus',
                        'culture',
                        'confidentialNote',
                    ])
                    ->latest()
                    ->first();
            }
        }
        
        // If no project found and user is CEO, try to find any project with submitted diagnosis
        // This handles the case where CEO is not yet attached to company
        if (!$latestProject && $user->hasRole('ceo')) {
            $latestProject = HrProject::with([
                    'company',
                    'ceoPhilosophy',
                    'organizationDesign',
                    'performanceSystem',
                    'compensationSystem',
                    'businessProfile',
                    'workforce',
                    'currentHrStatus',
                    'culture',
                    'confidentialNote',
                ])
                ->get()
                ->filter(function($project) {
                    $project->initializeStepStatuses();
                    $project->refresh();
                    $diagnosisStatus = $project->getStepStatus('diagnosis');
                    $hasCeoPhilosophy = $project->ceoPhilosophy && $project->ceoPhilosophy->completed_at;
                    return $diagnosisStatus === 'submitted' && !$hasCeoPhilosophy;
                })
                ->sortByDesc('updated_at')
                ->first();
            
            // If still no project, get any project
            if (!$latestProject) {
                $latestProject = HrProject::with([
                        'company',
                        'ceoPhilosophy',
                        'organizationDesign',
                        'performanceSystem',
                        'compensationSystem',
                        'businessProfile',
                        'workforce',
                        'currentHrStatus',
                        'culture',
                        'confidentialNote',
                    ])
                    ->whereHas('company', function($query) use ($user) {
                        $query->whereHas('users', function($q) use ($user) {
                            $q->where('users.id', $user->id)
                              ->where('company_users.role', 'ceo');
                        });
                    })
                    ->latest()
                    ->first();
            }
        }

        // Initialize step statuses FIRST before checking
        if ($latestProject) {
            $latestProject->initializeStepStatuses();
            // Refresh to ensure step_statuses is loaded
            $latestProject->refresh();
            // Reload CEO philosophy relationship to ensure it's fresh
            $latestProject->load('ceoPhilosophy');
        }
        
        // Get step statuses
        $stepStatuses = [
            'diagnosis' => $latestProject ? $latestProject->getStepStatus('diagnosis') : 'not_started',
            'organization' => $latestProject ? $latestProject->getStepStatus('organization') : 'not_started',
            'performance' => $latestProject ? $latestProject->getStepStatus('performance') : 'not_started',
            'compensation' => $latestProject ? $latestProject->getStepStatus('compensation') : 'not_started',
        ];
        
        // Check CEO Philosophy Survey status AFTER getting step statuses
        $ceoPhilosophyStatus = 'not_started';
        if ($latestProject && $latestProject->ceoPhilosophy) {
            // If CEO philosophy exists, check if it's completed
            $ceoPhilosophyStatus = $latestProject->ceoPhilosophy->completed_at ? 'completed' : 'in_progress';
        } elseif ($latestProject && $stepStatuses['diagnosis'] === 'submitted') {
            // If diagnosis is submitted and no CEO philosophy exists, survey should be available
            $ceoPhilosophyStatus = 'not_started';
        } elseif ($latestProject) {
            // If diagnosis is not submitted, survey is locked
            $ceoPhilosophyStatus = 'locked';
        } else {
            // No project found
            $ceoPhilosophyStatus = 'locked';
        }
        
        // Get all steps status (for compatibility)
        $stepsStatus = [
            'diagnosis' => $latestProject && in_array($stepStatuses['diagnosis'], ['in_progress', 'submitted']),
            'organization' => $latestProject && in_array($stepStatuses['organization'], ['in_progress', 'submitted']),
            'performance' => $latestProject && in_array($stepStatuses['performance'], ['in_progress', 'submitted']),
            'compensation' => $latestProject && in_array($stepStatuses['compensation'], ['in_progress', 'submitted']),
        ];

        // Get pending verifications (steps that are submitted but not yet verified/unlocked)
        $pendingVerifications = [];
        if ($latestProject) {
            $stepNames = [
                'diagnosis' => 'Diagnosis – Step 1',
                'organization' => 'Organization Design – Step 2',
                'performance' => 'Performance System – Step 3',
                'compensation' => 'Compensation System – Step 4',
            ];
            
            foreach ($stepStatuses as $step => $status) {
                if ($status === 'submitted') {
                    // Check if next step is still locked (meaning this step needs verification)
                    $stepOrder = ['diagnosis' => 'organization', 'organization' => 'performance', 'performance' => 'compensation'];
                    $nextStep = $stepOrder[$step] ?? null;
                    
                    if ($nextStep) {
                        $nextStepStatus = $stepStatuses[$nextStep] ?? 'not_started';
                        if ($nextStepStatus === 'not_started') {
                            $pendingVerifications[] = [
                                'step' => $step,
                                'stepName' => $stepNames[$step] ?? $step,
                                'projectId' => $latestProject->id,
                            ];
                        }
                    }
                }
            }
        }

        $allStepsComplete = collect($stepsStatus)->every(fn($status) => $status === true);

        // Get company diagnosis summary data
        $diagnosisSummary = null;
        if ($latestProject && $latestProject->company) {
            $totalEmployees = $latestProject->workforce?->total_employees ?? 0;
            $diagnosisSummary = [
                'company_name' => $latestProject->company->name,
                'industry' => $latestProject->company->industry ?? 'N/A',
                'employees' => $totalEmployees,
                'has_diagnosis' => $stepStatuses['diagnosis'] === 'submitted',
            ];
        }

        // Get all HR Projects for listing
        $hrProjects = [];
        if (!empty($companyIds)) {
            $hrProjects = HrProject::whereIn('company_id', $companyIds)
                ->with([
                    'company' => function($query) {
                        $query->with(['users' => function($q) {
                            $q->wherePivot('role', 'hr_manager');
                        }]);
                    }
                ])
                ->latest()
                ->get()
                ->map(function($project) {
                    $project->initializeStepStatuses();
                    $project->refresh();
                    
                    $project->load('ceoPhilosophy');
                    
                    $hrManager = $project->company->users->first();
                    
                    $projectStepStatuses = [
                        'diagnosis' => $project->getStepStatus('diagnosis'),
                        'organization' => $project->getStepStatus('organization'),
                        'performance' => $project->getStepStatus('performance'),
                        'compensation' => $project->getStepStatus('compensation'),
                    ];
                    
                    // Check CEO Philosophy Survey status for this project
                    $projectCeoPhilosophyStatus = 'not_started';
                    if ($project->ceoPhilosophy) {
                        $projectCeoPhilosophyStatus = $project->ceoPhilosophy->completed_at ? 'completed' : 'in_progress';
                    } elseif ($projectStepStatuses['diagnosis'] === 'submitted') {
                        $projectCeoPhilosophyStatus = 'not_started'; // Available for survey
                    } else {
                        $projectCeoPhilosophyStatus = 'locked'; // Waiting for diagnosis
                    }
                    
                    $completedSteps = collect($projectStepStatuses)->filter(fn($status) => $status === 'submitted')->count();
                    $totalSteps = 4;
                    
                    return [
                        'id' => $project->id,
                        'company_id' => $project->company_id,
                        'company_name' => $project->company->name,
                        'company_industry' => $project->company->industry,
                        'hr_manager_id' => $hrManager?->id,
                        'hr_manager_name' => $hrManager?->name,
                        'hr_manager_email' => $hrManager?->email,
                        'status' => $project->status,
                        'current_step' => $project->current_step,
                        'step_statuses' => $projectStepStatuses,
                        'ceo_philosophy_status' => $projectCeoPhilosophyStatus,
                        'completed_steps' => $completedSteps,
                        'total_steps' => $totalSteps,
                        'progress_percentage' => $totalSteps > 0 ? round(($completedSteps / $totalSteps) * 100) : 0,
                        'created_at' => $project->created_at,
                        'updated_at' => $project->updated_at,
                    ];
                })
                ->values();
        }

        // Get consultant reviews for latest project
        $consultantReviews = [];
        if ($latestProject) {
            $consultantReviews = \App\Models\ConsultantReview::where('hr_project_id', $latestProject->id)
                ->with('consultant')
                ->latest()
                ->get()
                ->map(function($review) {
                    return [
                        'id' => $review->id,
                        'opinions' => $review->opinions,
                        'risk_notes' => $review->risk_notes,
                        'alignment_observations' => $review->alignment_observations,
                        'consultant_name' => $review->consultant->name ?? 'Consultant',
                        'reviewed_at' => $review->reviewed_at,
                        'created_at' => $review->created_at,
                    ];
                });
        }

        // Calculate overall progress
        $overallProgress = 0;
        if ($latestProject) {
            $completedSteps = collect($stepStatuses)->filter(fn($status) => $status === 'submitted')->count();
            $overallProgress = ($completedSteps / 4) * 100;
        }

        // Prepare project data with company info for clarity
        $projectData = null;
        if ($latestProject) {
            $projectData = [
                'id' => $latestProject->id,
                'company_id' => $latestProject->company_id,
                'company_name' => $latestProject->company->name ?? 'Unknown Company',
                'company_industry' => $latestProject->company->industry ?? null,
                'status' => $latestProject->status,
                'current_step' => $latestProject->current_step,
                'ceo_philosophy' => $latestProject->ceoPhilosophy ? [
                    'main_trait' => $latestProject->ceoPhilosophy->main_trait,
                    'sub_trait' => $latestProject->ceoPhilosophy->sub_trait,
                    'completed_at' => $latestProject->ceoPhilosophy->completed_at,
                ] : null,
            ];
        }

        return Inertia::render('CEO/Dashboard/Index', [
            'company' => $companies->first(),
            'project' => $projectData ?? $latestProject,
            'ceoPhilosophyStatus' => $ceoPhilosophyStatus,
            'stepsStatus' => $stepsStatus,
            'stepStatuses' => $stepStatuses,
            'pendingVerifications' => $pendingVerifications,
            'allStepsComplete' => $allStepsComplete,
            'diagnosisSummary' => $diagnosisSummary,
            'hrProjects' => $hrProjects,
            'consultantReviews' => $consultantReviews,
            'overallProgress' => $overallProgress,
        ]);
    }

    public function viewHrProject(Request $request, HrProject $hrProject)
    {
        $user = auth()->user();
        
        // Verify CEO has access to this project's company
        $companies = $user->companies()->wherePivot('role', 'ceo')->get();
        if (!$companies->pluck('id')->contains($hrProject->company_id)) {
            abort(403, 'You do not have access to this project.');
        }
        
        // Load all project relationships
        $hrProject->load([
            'company',
            'ceoPhilosophy',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'businessProfile',
            'workforce',
            'currentHrStatus',
            'culture',
            'confidentialNote',
        ]);
        
        // Initialize step statuses
        $hrProject->initializeStepStatuses();
        $hrProject->refresh();
        
        // Get step statuses
        $stepStatuses = [
            'diagnosis' => $hrProject->getStepStatus('diagnosis'),
            'organization' => $hrProject->getStepStatus('organization'),
            'performance' => $hrProject->getStepStatus('performance'),
            'compensation' => $hrProject->getStepStatus('compensation'),
        ];
        
        // Get HR Manager info
        $hrManager = $hrProject->company->users()
            ->wherePivot('role', 'hr_manager')
            ->first();
        
        // Check CEO Philosophy Survey status
        $ceoPhilosophyStatus = 'not_started';
        if ($hrProject->ceoPhilosophy) {
            $ceoPhilosophyStatus = $hrProject->ceoPhilosophy->completed_at ? 'completed' : 'in_progress';
        } elseif ($stepStatuses['diagnosis'] === 'submitted') {
            $ceoPhilosophyStatus = 'not_started';
        } else {
            $ceoPhilosophyStatus = 'locked';
        }
        
        // Calculate progress
        $completedSteps = collect($stepStatuses)->filter(fn($status) => $status === 'submitted')->count();
        $totalSteps = 4;
        $progressPercentage = $totalSteps > 0 ? round(($completedSteps / $totalSteps) * 100) : 0;
        
        return Inertia::render('CEO/HRProject/View', [
            'project' => $hrProject,
            'hrManager' => $hrManager ? [
                'id' => $hrManager->id,
                'name' => $hrManager->name,
                'email' => $hrManager->email,
            ] : null,
            'stepStatuses' => $stepStatuses,
            'ceoPhilosophyStatus' => $ceoPhilosophyStatus,
            'completedSteps' => $completedSteps,
            'totalSteps' => $totalSteps,
            'progressPercentage' => $progressPercentage,
        ]);
    }

    public function approvals()
    {
        $user = auth()->user();
        $companies = $user->companies()->wherePivot('role', 'ceo')->get();
        
        $projects = HrProject::whereIn('company_id', $companies->pluck('id'))
            ->where('status', 'pending_ceo_approval')
            ->with(['company', 'ceoApproval', 'ceoPhilosophy', 'organizationDesign', 'performanceSystem', 'compensationSystem'])
            ->paginate(10);

        return Inertia::render('Dashboard/CEO/Approvals', [
            'projects' => $projects
        ]);
    }
}