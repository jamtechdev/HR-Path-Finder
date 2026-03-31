<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminComment;
use App\Models\HrProject;
use App\Models\User;
use App\Enums\StepStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        // Get projects with KPIs that need Admin review
        $pendingKpiReviews = $projects->filter(function ($project) {
            $performanceStatus = $project->getStepStatus('performance');
            $hasKpis = \App\Models\OrganizationalKpi::where('hr_project_id', $project->id)->exists();
            return $hasKpis && ($performanceStatus && in_array($performanceStatus->value, ['in_progress', 'submitted']));
        });

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

        // Get all companies for CEO assignment
        $companies = \App\Models\Company::select('id', 'name')->orderBy('name')->get();

        // Beta approval user list (non-admin): HR Manager + CEO
        $users = User::query()
            ->whereHas('roles', function ($query): void {
                $query->whereIn('name', ['hr_manager', 'ceo']);
            })
            ->with(['companies'])
            ->with('roles')
            ->get(['id', 'name', 'email', 'email_verified_at', 'created_at', 'access_granted_at']);

        $usersPayload = $users->map(function (User $user): array {
            $role = $user->hasRole('ceo') ? 'ceo' : 'hr_manager';
            $approvalStatus = $user->access_granted_at ? 'active' : 'pending';

            // Filter companies by pivot role for display.
            $companyNames = $user->companies
                ->filter(function ($company) use ($role): bool {
                    return $company->pivot?->role === $role;
                })
                ->pluck('name')
                ->values()
                ->all();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'companyNames' => $companyNames,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
                'access_granted_at' => $user->access_granted_at?->toIso8601String(),
                'approval_status' => $approvalStatus,
            ];
        })->values()->all();

        $totalHrUsers = $users->filter(fn (User $u) => $u->hasRole('hr_manager'))->count();
        $totalCeoUsers = $users->filter(fn (User $u) => $u->hasRole('ceo'))->count();

        return Inertia::render('Dashboard/Admin/Index', [
            'projects' => $projects,
            'stats' => [
                'total_projects' => $totalProjects,
                'total_companies' => $totalCompanies,
                'active_projects' => $activeProjects,
                'completed_projects' => $completedProjects,
                'pending_diagnosis' => $pendingDiagnosis,
                'pending_ceo_survey' => $pendingCeoSurvey,
                'pending_kpi_review' => $pendingKpiReviews->count(),
            ],
            'recentProjects' => $recentProjects,
            'pendingKpiReviews' => $pendingKpiReviews->values(),
            'projectsNeedingPerformanceRecommendation' => $projectsNeedingPerformanceRecommendation,
            'projectsNeedingCompensationRecommendation' => $projectsNeedingCompensationRecommendation,
            'companies' => $companies,
            'total_hr_users' => $totalHrUsers,
            'total_ceo_users' => $totalCeoUsers,
            'users' => $usersPayload,
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
        ])->orderByDesc('created_at')->get();

        return Inertia::render('Admin/ProjectTree', [
            'projects' => $projects,
        ]);
    }

    public function resetProject(Request $request, HrProject $hrProject): RedirectResponse
    {
        if (! $request->user()?->hasRole('admin')) {
            abort(403);
        }

        DB::transaction(function () use ($hrProject): void {
            $hrProject->diagnosis()->delete();
            $hrProject->ceoPhilosophy()->delete();
            $hrProject->companyAttributes()->delete();
            $hrProject->organizationalSentiment()->delete();
            $hrProject->organizationDesign()->delete();
            $hrProject->performanceSystem()->delete();
            $hrProject->compensationSystem()->delete();
            $hrProject->hrPolicyOs()->delete();
            $hrProject->performanceSnapshotResponses()->delete();
            $hrProject->organizationalKpis()->delete();
            $hrProject->kpiReviewTokens()->delete();
            $hrProject->evaluationModelAssignments()->delete();
            $hrProject->evaluationStructure()->delete();
            $hrProject->compensationSnapshotResponses()->delete();
            $hrProject->baseSalaryFramework()->delete();
            $hrProject->payBands()->delete();
            $hrProject->salaryTables()->delete();
            $hrProject->payBandOperationCriteria()->delete();
            $hrProject->bonusPoolConfiguration()->delete();
            $hrProject->benefitsConfiguration()->delete();
            $hrProject->adminComments()->delete();

            $hrProject->step_statuses = [
                'diagnosis' => StepStatus::NOT_STARTED->value,
                'job_analysis' => StepStatus::NOT_STARTED->value,
                'performance' => StepStatus::NOT_STARTED->value,
                'compensation' => StepStatus::NOT_STARTED->value,
                'hr_policy_os' => StepStatus::NOT_STARTED->value,
            ];
            $hrProject->save();
        });

        return back()->with('success', 'Project data has been reset.');
    }

    public function destroyProject(Request $request, HrProject $hrProject): RedirectResponse
    {
        if (! $request->user()?->hasRole('admin')) {
            abort(403);
        }

        DB::transaction(function () use ($hrProject): void {
            $hrProject->adminComments()->delete();
            $hrProject->diagnosis()->delete();
            $hrProject->ceoPhilosophy()->delete();
            $hrProject->companyAttributes()->delete();
            $hrProject->organizationalSentiment()->delete();
            $hrProject->organizationDesign()->delete();
            $hrProject->performanceSystem()->delete();
            $hrProject->compensationSystem()->delete();
            $hrProject->hrPolicyOs()->delete();
            $hrProject->performanceSnapshotResponses()->delete();
            $hrProject->organizationalKpis()->delete();
            $hrProject->kpiReviewTokens()->delete();
            $hrProject->evaluationModelAssignments()->delete();
            $hrProject->evaluationStructure()->delete();
            $hrProject->compensationSnapshotResponses()->delete();
            $hrProject->baseSalaryFramework()->delete();
            $hrProject->payBands()->delete();
            $hrProject->salaryTables()->delete();
            $hrProject->payBandOperationCriteria()->delete();
            $hrProject->bonusPoolConfiguration()->delete();
            $hrProject->benefitsConfiguration()->delete();
            $hrProject->delete();
        });

        return back()->with('success', 'Project deleted successfully.');
    }
}
