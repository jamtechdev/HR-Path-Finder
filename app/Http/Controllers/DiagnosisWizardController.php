<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\HrProject;
use App\Models\IndustryCategory;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

class DiagnosisWizardController extends Controller
{
    /**
     * Show diagnosis wizard tab (without project ID).
     * Handles routes: diagnosis and diagnosis/{tab}
     * Checks for existing project, creates one if company exists, or redirects to create company.
     */
    public function show(Request $request, ?string $tab = null): Response|RedirectResponse
    {
        $user = $request->user();
        $activeTab = $tab ?? 'overview';

        // Try to get user's active project
        $hrProject = null;
        if ($user && $user->hasRole('hr_manager')) {
            $hrProject = HrProject::whereHas('company', function ($query) use ($user) {
                $query->whereHas('users', function ($q) use ($user) {
                    $q->where('users.id', $user->id)
                      ->where('company_users.role', 'hr_manager');
                });
            })->where('status', 'active')->first();

            // If no project exists, check if user has a company
            if (!$hrProject) {
                $company = \App\Models\Company::whereHas('users', function ($q) use ($user) {
                    $q->where('users.id', $user->id)
                      ->where('company_users.role', 'hr_manager');
                })->first();

                // If company exists, create a project for it
                if ($company) {
                    $hrProject = \App\Models\HrProject::create([
                        'company_id' => $company->id,
                        'status' => \App\Enums\ProjectStatus::ACTIVE,
                        'step_statuses' => [
                            'diagnosis' => \App\Enums\StepStatus::IN_PROGRESS->value,
                            'organization' => \App\Enums\StepStatus::NOT_STARTED->value,
                            'performance' => \App\Enums\StepStatus::NOT_STARTED->value,
                            'compensation' => \App\Enums\StepStatus::NOT_STARTED->value,
                        ],
                    ]);
                } else {
                    // No company exists, redirect to create company
                    return redirect()->route('companies.create')
                        ->with('info', 'Please create a company first to start the diagnosis process.');
                }
            }
        }

        return $this->renderDiagnosisPage($request, $hrProject, $activeTab);
    }

    /**
     * Show diagnosis wizard tab (with project ID).
     * Handles route: diagnosis/{hrProject}/{tab}
     */
    public function showWithProject(Request $request, HrProject $hrProject, ?string $tab = null): Response
    {
        $activeTab = $tab ?? 'overview';
        return $this->renderDiagnosisPage($request, $hrProject, $activeTab);
    }

    /**
     * Render the diagnosis page.
     */
    protected function renderDiagnosisPage(Request $request, ?HrProject $hrProject, string $activeTab): Response|RedirectResponse
    {
        $user = $request->user();

        // If still no project, redirect to create company
        if (!$hrProject) {
            return redirect()->route('companies.create')
                ->with('info', 'Please create a company first to start the diagnosis process.');
        }

        // Check authorization
        if (!$hrProject->company->users->contains($user) && !$user->hasRole(['consultant', 'admin'])) {
            abort(403);
        }

        // Load relationships
        $hrProject->load(['company', 'diagnosis']);

        // Get diagnosis or create empty one
        $diagnosis = $hrProject->diagnosis;
        if (!$diagnosis) {
            $diagnosis = $hrProject->diagnosis()->create([
                'status' => StepStatus::IN_PROGRESS,
            ]);
        }

        // Get step statuses and calculate if needed
        $stepStatuses = $hrProject->step_statuses ?? [];
        $diagnosisStatus = $stepStatuses['diagnosis'] ?? 'not_started';
        
        // Calculate individual step statuses if diagnosis exists
        if ($diagnosis && $diagnosis->exists) {
            $stepStatuses = $this->calculateDiagnosisStepStatuses($diagnosis, $stepStatuses);
        }

        // Determine which component to render based on tab
        // Tab order according to specification:
        // 1. Basic Info (company-info) - Essential
        // 2. Workforces - Essential
        // 3. Executives - Optional
        // 4. Leaders - Optional
        // 5. Job Grade system - Optional
        // 6. Org. Chart - Essential
        // 7. Org. Structure - Essential
        // 8. Job Structure - Essential
        // 9. Key HR/Org. Issues - Essential
        $componentMap = [
            'overview' => 'Diagnosis/Overview',
            'company-info' => 'Diagnosis/CompanyInfo',
            'workforce' => 'Diagnosis/Workforce',
            'executives' => 'Diagnosis/Executives',
            'leaders' => 'Diagnosis/Leaders',
            'job-grades' => 'Diagnosis/JobGrades',
            'organizational-charts' => 'Diagnosis/OrganizationalCharts',
            'organizational-structure' => 'Diagnosis/OrganizationalStructure',
            'job-structure' => 'Diagnosis/JobStructure',
            'hr-issues' => 'Diagnosis/HrIssues',
            'review' => 'Diagnosis/Review',
        ];

        $component = $componentMap[$activeTab] ?? 'Diagnosis/Overview';

        // Load industry categories with subcategories for company-info tab
        $industryCategories = [];
        if ($activeTab === 'company-info') {
            $industryCategories = IndustryCategory::with('subCategories')
                ->orderBy('order')
                ->orderBy('name')
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'subCategories' => $category->subCategories->map(function ($sub) {
                            return [
                                'id' => $sub->id,
                                'name' => $sub->name,
                            ];
                        })->toArray(),
                    ];
                })->toArray();
        }

        // Load HR issues for hr-issues tab
        $hrIssues = [];
        if ($activeTab === 'hr-issues') {
            $hrIssues = \App\Models\HrIssue::where('is_active', true)
                ->orderBy('category')
                ->orderBy('order')
                ->get()
                ->toArray();
        }

        // Ensure company is loaded
        if (!$hrProject->relationLoaded('company')) {
            $hrProject->load('company');
        }
        
        // Ensure company exists
        if (!$hrProject->company) {
            return redirect()->route('hr-manager.dashboard')
                ->with('error', 'Company not found for this project.');
        }

        // Get main workflow step statuses for sidebar
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'organization' => $stepStatuses['organization'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
        ];

        return Inertia::render($component, [
            'project' => $hrProject,
            'company' => $hrProject->company,
            'diagnosis' => $diagnosis,
            'activeTab' => $activeTab,
            'diagnosisStatus' => $diagnosisStatus,
            'stepStatuses' => $stepStatuses,
            'mainStepStatuses' => $mainStepStatuses,
            'projectId' => $hrProject->id,
            'industryCategories' => $industryCategories,
            'hrIssues' => $hrIssues,
        ]);
    }
    
    /**
     * Calculate individual diagnosis step statuses based on data.
     */
    protected function calculateDiagnosisStepStatuses($diagnosis, array $stepStatuses): array
    {
        // Define step completion checks
        $stepChecks = [
            'company-info' => function($diagnosis) {
                return !empty($diagnosis->industry_category);
            },
            'workforce' => function($diagnosis) {
                return !empty($diagnosis->present_headcount) && $diagnosis->present_headcount > 0;
            },
            'executives' => function($diagnosis) {
                return !empty($diagnosis->total_executives) || (!empty($diagnosis->executive_positions) && is_array($diagnosis->executive_positions) && count($diagnosis->executive_positions) > 0);
            },
            'leaders' => function($diagnosis) {
                return !empty($diagnosis->leadership_count);
            },
            'job-grades' => function($diagnosis) {
                return !empty($diagnosis->job_grade_names) && is_array($diagnosis->job_grade_names) && count($diagnosis->job_grade_names) > 0;
            },
            'organizational-charts' => function($diagnosis) {
                $charts = $diagnosis->organizational_charts;
                if (is_array($charts)) {
                    return count($charts) > 0;
                }
                if (is_object($charts)) {
                    return count((array)$charts) > 0;
                }
                return false;
            },
            'organizational-structure' => function($diagnosis) {
                // Check both org_structure_types (from database) and organizational_structure (from form)
                $structure = $diagnosis->org_structure_types ?? $diagnosis->organizational_structure ?? null;
                if (is_array($structure)) {
                    return count($structure) > 0;
                }
                if (is_object($structure)) {
                    return count((array)$structure) > 0;
                }
                return false;
            },
            'job-structure' => function($diagnosis) {
                return (!empty($diagnosis->job_categories) && is_array($diagnosis->job_categories) && count($diagnosis->job_categories) > 0) ||
                       (!empty($diagnosis->job_functions) && is_array($diagnosis->job_functions) && count($diagnosis->job_functions) > 0);
            },
            'hr-issues' => function($diagnosis) {
                return (!empty($diagnosis->hr_issues) && is_array($diagnosis->hr_issues) && count($diagnosis->hr_issues) > 0) ||
                       !empty($diagnosis->custom_hr_issues);
            },
        ];
        
        // Update step statuses based on completion
        foreach ($stepChecks as $step => $check) {
            if ($check($diagnosis)) {
                // Only update if not already set to a higher status
                if (!isset($stepStatuses[$step]) || in_array($stepStatuses[$step], ['not_started', 'in_progress'])) {
                    $stepStatuses[$step] = 'completed';
                }
            } elseif (!isset($stepStatuses[$step])) {
                // Check if there's partial data
                $hasData = false;
                switch ($step) {
                    case 'company-info':
                        $hasData = !empty($diagnosis->industry_category) || !empty($diagnosis->industry_subcategory);
                        break;
                    case 'workforce':
                        $hasData = !empty($diagnosis->present_headcount) || !empty($diagnosis->expected_headcount_1y);
                        break;
                    case 'executives':
                        $hasData = !empty($diagnosis->total_executives) || 
                                  (!empty($diagnosis->executive_positions) && (
                                      (is_array($diagnosis->executive_positions) && count($diagnosis->executive_positions) > 0) ||
                                      (is_object($diagnosis->executive_positions) && count((array)$diagnosis->executive_positions) > 0)
                                  ));
                        break;
                    case 'leaders':
                        $hasData = !empty($diagnosis->leadership_count);
                        break;
                    case 'job-grades':
                        $hasData = !empty($diagnosis->job_grade_names);
                        break;
                    case 'organizational-charts':
                        $hasData = !empty($diagnosis->organizational_charts);
                        break;
                    case 'organizational-structure':
                        $hasData = !empty($diagnosis->org_structure_types) || !empty($diagnosis->organizational_structure);
                        break;
                    case 'job-structure':
                        $hasData = !empty($diagnosis->job_categories) || !empty($diagnosis->job_functions);
                        break;
                    case 'hr-issues':
                        $hasData = !empty($diagnosis->hr_issues) || !empty($diagnosis->custom_hr_issues);
                        break;
                }
                
                if ($hasData) {
                    $stepStatuses[$step] = 'in_progress';
                }
            }
        }
        
        return $stepStatuses;
    }
}
