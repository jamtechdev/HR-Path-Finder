<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CeoDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Ensure user is authenticated
        if (!$user) {
            return redirect()->route('login');
        }
        
        // Ensure user has CEO role - only CEO role can access this dashboard
        // Allow access if user has CEO role (even if they switched from HR)
        if (!$user->hasRole('ceo')) {
            abort(403, 'You do not have permission to access this page. CEO role is required.');
        }
        
        // If user switched from HR, ensure they're viewing CEO content only
        $activeRole = $request->session()->get('active_role');
        if ($activeRole === 'ceo') {
            // User switched from HR to CEO, show only CEO content
        }
        
        // Get projects where user is CEO (only filter by CEO role, not HR Manager role)
        $projects = HrProject::whereHas('company', function ($query) use ($user) {
            $query->whereHas('users', function ($q) use ($user) {
                $q->where('users.id', $user->id)
                  ->where('company_users.role', 'ceo');
            });
        })->with(['company', 'diagnosis', 'ceoPhilosophy', 'organizationDesign', 'performanceSystem', 'compensationSystem'])->get();

        // Get pending reviews (diagnosis submitted but not approved)
        $pendingReviews = $projects->filter(function ($project) {
            $status = $project->getStepStatus('diagnosis');
            return $status && $status->value === 'submitted';
        });

        // Calculate statistics
        $totalProjects = $projects->count();
        $pendingDiagnosisReview = $pendingReviews->count();
        $pendingCeoSurvey = $projects->filter(function ($project) {
            $diagnosisStatus = $project->getStepStatus('diagnosis');
            return $diagnosisStatus && $diagnosisStatus->value === 'submitted' && !$project->ceoPhilosophy;
        })->count();

        $completedProjects = $projects->filter(function ($project) {
            return $project->isFullyLocked();
        })->count();

        // Get projects needing attention
        $needsAttention = $projects->filter(function ($project) {
            $diagnosisStatus = $project->getStepStatus('diagnosis');
            return ($diagnosisStatus && $diagnosisStatus->value === 'submitted') || 
                   (!$project->ceoPhilosophy && $diagnosisStatus && $diagnosisStatus->value === 'submitted');
        })->take(5)->values();

        // Calculate detailed progress for each project
        $projectsWithProgress = $projects->map(function ($project) {
            $stepStatuses = $project->step_statuses ?? [];
            
            // Calculate HR progress (all 5 steps)
            $hrSteps = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'hr_policy_os'];
            $hrCompleted = 0;
            $hrInProgress = 0;
            $hrSubmitted = 0;
            $ceoVerified = 0;
            
            foreach ($hrSteps as $step) {
                $status = $stepStatuses[$step] ?? 'not_started';
                if (in_array($status, ['approved', 'locked', 'completed'])) {
                    $hrCompleted++;
                    $ceoVerified++; // CEO has verified
                } elseif ($status === 'submitted') {
                    $hrSubmitted++; // HR submitted, waiting for CEO verification
                } elseif (in_array($status, ['in_progress'])) {
                    $hrInProgress++;
                }
            }
            
            // Calculate CEO progress
            $ceoProgress = [
                'diagnosis_review' => 'not_started',
                'survey' => 'not_started',
            ];
            
            $diagnosisStatus = $project->getStepStatus('diagnosis');
            if ($diagnosisStatus && $diagnosisStatus->value === 'submitted') {
                $ceoProgress['diagnosis_review'] = 'available';
                if ($project->ceoPhilosophy) {
                    $ceoProgress['survey'] = 'completed';
                } else {
                    $ceoProgress['survey'] = 'pending';
                }
            } elseif ($diagnosisStatus && in_array($diagnosisStatus->value, ['approved', 'locked'])) {
                $ceoProgress['diagnosis_review'] = 'completed';
            }
            
            return [
                'id' => $project->id,
                'company' => $project->company ? [
                    'id' => $project->company->id,
                    'name' => $project->company->name,
                ] : null,
                'step_statuses' => $stepStatuses,
                'diagnosis' => $project->diagnosis,
                'ceoPhilosophy' => $project->ceoPhilosophy,
                'hr_progress' => [
                    'completed' => $hrCompleted,
                    'in_progress' => $hrInProgress,
                    'submitted' => $hrSubmitted,
                    'total' => 5,
                ],
                'ceo_progress' => [
                    ...$ceoProgress,
                    'verified_steps' => $ceoVerified,
                    'pending_verification' => $hrSubmitted,
                ],
                'created_at' => $project->created_at,
            ];
        });

        return Inertia::render('Dashboard/CEO/Index', [
            'projects' => $projectsWithProgress,
            'pendingReviews' => $pendingReviews->values(),
            'stats' => [
                'total_projects' => $totalProjects,
                'pending_diagnosis_review' => $pendingDiagnosisReview,
                'pending_ceo_survey' => $pendingCeoSurvey,
                'completed_projects' => $completedProjects,
            ],
            'needsAttention' => $needsAttention,
        ]);
    }
}
