<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\HrProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DiagnosisWizardController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        // #region agent log
        $logPath = base_path('.cursor/debug.log');
        $logDir = dirname($logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_entry','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:17','message'=>'show() method entry','data'=>['path'=>$request->path(),'url'=>$request->url(),'routeName'=>$request->route()?->getName()],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'A,B'])."\n", FILE_APPEND);
        // #endregion
        
        $user = Auth::user();
        
        // #region agent log
        $logPath = base_path('.cursor/debug.log');
        file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_user','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:22','message'=>'User retrieved','data'=>['userId'=>$user?->id,'hasUser'=>!is_null($user)],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'C'])."\n", FILE_APPEND);
        // #endregion
        
        $companyId = $request->query('company_id');
        
        // Get route parameters directly from the request
        $route = $request->route();
        
        // #region agent log
        $logPath = base_path('.cursor/debug.log');
        file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_route','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:28','message'=>'Route object check','data'=>['hasRoute'=>!is_null($route),'routeName'=>$route?->getName(),'routeAction'=>$route?->getActionName()],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'A,B'])."\n", FILE_APPEND);
        // #endregion
        
        $routeParams = $route ? $route->parameters() : [];
        
        // #region agent log
        $logPath = base_path('.cursor/debug.log');
        file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_params','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:32','message'=>'Route parameters extracted','data'=>['routeParams'=>$routeParams,'hasProjectId'=>isset($routeParams['projectId']),'hasTab'=>isset($routeParams['tab']),'projectIdValue'=>$routeParams['projectId']??null,'tabValue'=>$routeParams['tab']??null],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'A,B'])."\n", FILE_APPEND);
        // #endregion
        
        $activeTab = 'overview';
        $projectId = null;
        
        // Determine which route pattern was matched
        if (isset($routeParams['projectId']) && isset($routeParams['tab'])) {
            // Route pattern: diagnosis/{projectId}/{tab}
            $projectId = is_numeric($routeParams['projectId']) ? (int)$routeParams['projectId'] : null;
            $activeTab = $routeParams['tab'] ?? 'overview';
            
            // #region agent log
            $logPath = base_path('.cursor/debug.log');
            file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_pattern1','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:40','message'=>'Matched pattern: diagnosis/{projectId}/{tab}','data'=>['projectId'=>$projectId,'activeTab'=>$activeTab],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'B'])."\n", FILE_APPEND);
            // #endregion
        } elseif (isset($routeParams['tab'])) {
            // Route pattern: diagnosis/{tab}
            $activeTab = $routeParams['tab'] ?? 'overview';
            
            // #region agent log
            $logPath = base_path('.cursor/debug.log');
            file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_pattern2','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:46','message'=>'Matched pattern: diagnosis/{tab}','data'=>['activeTab'=>$activeTab],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'B'])."\n", FILE_APPEND);
            // #endregion
        } else {
            // #region agent log
            $logPath = base_path('.cursor/debug.log');
            file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_pattern3','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:50','message'=>'No route params matched, using default','data'=>['routeParams'=>$routeParams],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'A'])."\n", FILE_APPEND);
            // #endregion
        }
        
        // If projectId is provided in route, use it to find company
        if ($projectId) {
            $hrProject = \App\Models\HrProject::find($projectId);
            if ($hrProject) {
                $companyId = $hrProject->company_id;
            }
        }

        $companiesQuery = $user->companies()->with([
            'businessProfile',
            'workforce',
            'currentHrStatus',
            'culture',
            'confidentialNote',
            'executives',
            'jobGrades',
            'organizationalCharts',
            'hrIssues',
            'hrProjects.organizationDesign',
        ]);
        
        if ($companyId) {
            $companiesQuery->where('companies.id', $companyId);
        }

        $company = $companiesQuery->first();

        // Allow diagnosis form to work without company - company will be created on final submit
        // if (! $company) {
        //     return Inertia::render('companies/create');
        // }

        // Only authorize if company exists
        // Allow both HR Manager and CEO to view diagnosis workspace
        if ($company) {
            // Check if user is HR Manager or CEO for this company
            $isHrManager = $user->companies()->wherePivot('role', 'hr_manager')->where('companies.id', $company->id)->exists();
            $isCeo = $user->companies()->wherePivot('role', 'ceo')->where('companies.id', $company->id)->exists();
            
            if (!$isHrManager && !$isCeo) {
                abort(403, 'You do not have access to this company\'s diagnosis workspace.');
            }
        }

        // Validate tab parameter - if invalid or missing, default to 'overview'
        $validTabs = ['overview', 'company', 'company-info', 'business', 'business-profile', 'workforce', 'executives', 'job-grades', 'organizational-charts', 'organizational-structure', 'hr-issues', 'current-hr', 'culture', 'confidential', 'review'];
        if (!$activeTab || !in_array($activeTab, $validTabs)) {
            $activeTab = 'overview';
        }
        
        // Map tab names to component names (PascalCase for Inertia)
        $componentMap = [
            'company' => 'CompanyInfo',
            'company-info' => 'CompanyInfo',
            'business' => 'BusinessProfile',
            'business-profile' => 'BusinessProfile',
            'workforce' => 'Workforce',
            'executives' => 'Executives',
            'job-grades' => 'JobGrades',
            'organizational-charts' => 'OrganizationalCharts',
            'organizational-structure' => 'OrganizationalStructure',
            'hr-issues' => 'HrIssues',
            'current-hr' => 'CurrentHr',
            'culture' => 'Culture',
            'confidential' => 'Confidential',
            'review' => 'Review',
        ];
        
        $componentName = $componentMap[$activeTab] ?? 'Index';
        
        // Don't auto-set status to in_progress when accessing company tab
        // Status should only change when user clicks "Start Company Setup" button
        // This ensures overview page always shows "not_started" status initially
        
        // Redirect to path-based URL if accessed via query parameter (for backward compatibility)
        if ($request->query('tab') && $request->path() === 'diagnosis') {
            return redirect()->route('hr-manager.diagnosis.tab', ['tab' => $activeTab]);
        }

        // Render the appropriate component based on the tab
        // For overview, use Overview; for others, use the specific component
        $renderComponent = $activeTab === 'overview' ? 'Diagnosis/Overview' : "Diagnosis/{$componentName}";
        
        // #region agent log
        $logPath = base_path('.cursor/debug.log');
        file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_component','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:143','message'=>'Component selection','data'=>['activeTab'=>$activeTab,'renderComponent'=>$renderComponent,'componentName'=>$componentName],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D'])."\n", FILE_APPEND);
        // #endregion
        
        // Get or create HR Project for project data
        $hrProject = null;
        if ($company) {
            $hrProject = $company->hrProjects()->first();
        }
        
        // #region agent log
        $logPath = base_path('.cursor/debug.log');
        file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_company','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:152','message'=>'Company and project data','data'=>['hasCompany'=>!is_null($company),'companyId'=>$company?->id,'hasHrProject'=>!is_null($hrProject),'hrProjectId'=>$hrProject?->id],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'C'])."\n", FILE_APPEND);
        // #endregion
        
        // Prepare step statuses for Overview component
        $stepStatuses = null;
        if ($hrProject) {
            $hrProject->initializeStepStatuses();
            $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
            
            // If project status is 'completed' but step_statuses doesn't reflect it, sync it
            // This handles the case where status was updated but step_statuses wasn't
            if ($hrProject->status === 'completed' && $diagnosisStatus !== 'submitted' && $diagnosisStatus !== 'completed') {
                $hrProject->setStepStatus('diagnosis', 'submitted');
                $diagnosisStatus = 'submitted';
            }
            
            // Also check company diagnosis_status - if it's completed, ensure step_statuses reflects it
            if ($company && $company->diagnosis_status === 'completed' && $diagnosisStatus !== 'submitted' && $diagnosisStatus !== 'completed') {
                $hrProject->setStepStatus('diagnosis', 'submitted');
                $diagnosisStatus = 'submitted';
            }
            
            // Map 'completed' to 'submitted' for consistency
            if ($diagnosisStatus === 'completed') {
                $diagnosisStatus = 'submitted';
            }
            
            $stepStatuses = [
                'diagnosis' => $diagnosisStatus,
                'organization' => $hrProject->getStepStatus('organization'),
                'performance' => $hrProject->getStepStatus('performance'),
                'compensation' => $hrProject->getStepStatus('compensation'),
            ];
        } elseif ($company) {
            // Use company's diagnosis_status field, but map 'completed' to 'submitted' for consistency
            $diagnosisStatus = $company->diagnosis_status ?? 'not_started';
            if ($diagnosisStatus === 'completed') {
                $diagnosisStatus = 'submitted';
            }
            // Also check if all diagnosis data exists - if yes, mark as submitted
            $hasAllData = $company->businessProfile && 
                         $company->workforce && 
                         $company->executives && $company->executives->count() > 0 &&
                         $company->jobGrades && $company->jobGrades->count() > 0 &&
                         $company->currentHrStatus &&
                         $company->culture &&
                         ($company->hrProjects()->first()?->organizationDesign || true); // organization_design is optional
            
            if ($hasAllData && $diagnosisStatus !== 'submitted') {
                $diagnosisStatus = 'submitted';
            }
            
            $stepStatuses = [
                'diagnosis' => $diagnosisStatus,
                'organization' => $company->organization_status ?? 'not_started',
                'performance' => $company->performance_status ?? 'not_started',
                'compensation' => $company->compensation_status ?? 'not_started',
            ];
        }
        
        // Build project data - handle both cases: with and without HR project
        $projectData = null;
        if ($company) {
            // Determine project status - prioritize hrProject status, then company diagnosis_status
            // Note: hr_projects.status is ENUM: 'not_started', 'in_progress', 'completed', 'locked', 'pending_consultant_review'
            $projectStatus = $hrProject?->status ?? 'not_started';
            if (!$hrProject && $company->diagnosis_status) {
                // Map company diagnosis_status to project status
                if ($company->diagnosis_status === 'completed') {
                    $projectStatus = 'completed';
                } elseif ($company->diagnosis_status === 'in_progress') {
                    $projectStatus = 'in_progress';
                }
            } elseif ($hrProject && $hrProject->getStepStatus('diagnosis') === 'submitted') {
                // If step status is submitted, project status should be 'completed'
                $projectStatus = 'completed';
            }
            
            $projectData = [
                'id' => $hrProject?->id ?? null,
                'status' => $projectStatus,
                'current_step' => $hrProject?->current_step ?? null,
                'business_profile' => $company->businessProfile ? [
                    'id' => $company->businessProfile->id,
                    'annual_revenue' => $company->businessProfile->annual_revenue,
                    'operational_margin_rate' => $company->businessProfile->operational_margin_rate,
                    'annual_human_cost' => $company->businessProfile->annual_human_cost,
                    'business_type' => $company->businessProfile->business_type,
                ] : null,
                'workforce' => $company->workforce ? [
                    'id' => $company->workforce->id,
                    'headcount_year_minus_2' => $company->workforce->headcount_year_minus_2,
                    'headcount_year_minus_1' => $company->workforce->headcount_year_minus_1,
                    'headcount_current' => $company->workforce->headcount_current,
                    'total_employees' => $company->workforce->total_employees,
                    'contract_employees' => $company->workforce->contract_employees,
                    'expected_workforce_1_year' => $company->workforce->expected_workforce_1_year,
                    'expected_workforce_2_years' => $company->workforce->expected_workforce_2_years,
                    'expected_workforce_3_years' => $company->workforce->expected_workforce_3_years,
                    'average_tenure_active' => $company->workforce->average_tenure_active,
                    'average_tenure_leavers' => $company->workforce->average_tenure_leavers,
                    'average_age_active' => $company->workforce->average_age_active,
                    'male_employees' => $company->workforce->male_employees,
                    'female_employees' => $company->workforce->female_employees,
                    'total_leaders_above_team_leader' => $company->workforce->total_leaders_above_team_leader,
                    'leaders_percentage' => $company->workforce->leaders_percentage,
                    'org_chart_path' => $company->workforce->org_chart_path ? Storage::url($company->workforce->org_chart_path) : null,
                ] : null,
                'executives' => $company->executives->map(fn($e) => [
                    'id' => $e->id,
                    'position_title' => $e->position_title,
                    'number_of_executives' => $e->number_of_executives,
                    'is_custom' => $e->is_custom,
                ])->values()->toArray(),
                'job_grades' => $company->jobGrades->map(fn($g) => [
                    'id' => $g->id,
                    'grade_name' => $g->grade_name,
                    'grade_order' => $g->grade_order,
                    'promotion_rules' => $g->promotion_rules,
                    'promotion_to_grade' => $g->promotion_to_grade,
                ])->values()->toArray(),
                'organizational_charts' => $company->organizationalCharts->map(fn($c) => [
                    'id' => $c->id,
                    'chart_year_month' => $c->chart_year_month,
                    'file_path' => $c->file_path ? Storage::url($c->file_path) : null,
                    'file_name' => $c->file_name,
                ])->values()->toArray(),
                'organization_design' => $hrProject?->organizationDesign ? [
                    'structure_types' => $hrProject->organizationDesign->structure_types ?? [],
                ] : null,
                'hr_issues' => $company->hrIssues->map(fn($i) => [
                    'id' => $i->id,
                    'issue_type' => $i->issue_type,
                    'is_custom' => $i->is_custom,
                    'description' => $i->description,
                ])->values()->toArray(),
                'current_hr_status' => $company->currentHrStatus ? [
                    'id' => $company->currentHrStatus->id,
                    'dedicated_hr_team' => $company->currentHrStatus->dedicated_hr_team,
                    'labor_union_present' => $company->currentHrStatus->labor_union_present,
                    'labor_relations_stability' => $company->currentHrStatus->labor_relations_stability,
                    'evaluation_system_status' => $company->currentHrStatus->evaluation_system_status,
                    'compensation_system_status' => $company->currentHrStatus->compensation_system_status,
                    'evaluation_system_issues' => $company->currentHrStatus->evaluation_system_issues,
                    'job_rank_levels' => $company->currentHrStatus->job_rank_levels,
                    'job_title_levels' => $company->currentHrStatus->job_title_levels,
                ] : null,
                'culture' => $company->culture ? [
                    'id' => $company->culture->id,
                    'work_format' => $company->culture->work_format,
                    'decision_making_style' => $company->culture->decision_making_style,
                    'core_values' => $company->culture->core_values ?? [],
                ] : null,
                'confidential_note' => $company->confidentialNote ? [
                    'id' => $company->confidentialNote->id,
                    'notes' => $company->confidentialNote->notes,
                ] : null,
                'company' => [
                    'id' => $company->id,
                    'name' => $company->name,
                    'foundation_date' => $company->foundation_date?->format('Y-m-d'),
                    'hq_location' => $company->hq_location,
                    'industry' => $company->industry,
                    'industry_sub_category' => $company->industry_sub_category,
                    'registration_number' => $company->registration_number,
                    'public_listing_status' => $company->public_listing_status,
                ],
            ];
        }
        
        // #region agent log
        $logPath = base_path('.cursor/debug.log');
        file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_before_render','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:270','message'=>'Before Inertia render','data'=>['renderComponent'=>$renderComponent,'hasProjectData'=>!is_null($projectData),'hasCompany'=>!is_null($company)],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D'])."\n", FILE_APPEND);
        // #endregion
        
        try {
            $response = Inertia::render($renderComponent, [
                'project' => $projectData,
                'company' => $company ? [
                'id' => $company->id,
                'name' => $company->name,
                'brand_name' => $company->brand_name,
                'foundation_date' => $company->foundation_date?->format('Y-m-d'),
                'hq_location' => $company->hq_location,
                'industry' => $company->industry,
                'industry_sub_category' => $company->industry_sub_category,
                'secondary_industries' => $company->secondary_industries ?? [],
                'registration_number' => $company->registration_number,
                'public_listing_status' => $company->public_listing_status,
                'logo_path' => $company->logo_path ? Storage::url($company->logo_path) : null,
                'image_path' => $company->image_path ? Storage::url($company->image_path) : null,
                'diagnosis_status' => $company->diagnosis_status,
                'business_profile' => $company->businessProfile ? [
                    'annual_revenue' => $company->businessProfile->annual_revenue,
                    'operational_margin_rate' => $company->businessProfile->operational_margin_rate,
                    'annual_human_cost' => $company->businessProfile->annual_human_cost,
                    'business_type' => $company->businessProfile->business_type,
                ] : null,
                'workforce' => $company->workforce ? [
                    'headcount_year_minus_2' => $company->workforce->headcount_year_minus_2,
                    'headcount_year_minus_1' => $company->workforce->headcount_year_minus_1,
                    'headcount_current' => $company->workforce->headcount_current,
                    'total_employees' => $company->workforce->total_employees,
                    'contract_employees' => $company->workforce->contract_employees,
                    'expected_workforce_1_year' => $company->workforce->expected_workforce_1_year,
                    'expected_workforce_2_years' => $company->workforce->expected_workforce_2_years,
                    'expected_workforce_3_years' => $company->workforce->expected_workforce_3_years,
                    'average_tenure_active' => $company->workforce->average_tenure_active,
                    'average_tenure_leavers' => $company->workforce->average_tenure_leavers,
                    'average_age_active' => $company->workforce->average_age_active,
                    'male_employees' => $company->workforce->male_employees,
                    'female_employees' => $company->workforce->female_employees,
                    'total_leaders_above_team_leader' => $company->workforce->total_leaders_above_team_leader,
                    'leaders_percentage' => $company->workforce->leaders_percentage,
                    'org_chart_path' => $company->workforce->org_chart_path ? Storage::url($company->workforce->org_chart_path) : null,
                ] : null,
                'current_hr_status' => $company->currentHrStatus ? [
                    'dedicated_hr_team' => $company->currentHrStatus->dedicated_hr_team,
                    'labor_union_present' => $company->currentHrStatus->labor_union_present,
                    'labor_relations_stability' => $company->currentHrStatus->labor_relations_stability,
                    'evaluation_system_status' => $company->currentHrStatus->evaluation_system_status,
                    'compensation_system_status' => $company->currentHrStatus->compensation_system_status,
                    'evaluation_system_issues' => $company->currentHrStatus->evaluation_system_issues,
                    'job_rank_levels' => $company->currentHrStatus->job_rank_levels,
                    'job_title_levels' => $company->currentHrStatus->job_title_levels,
                ] : null,
                'culture' => $company->culture ? [
                    'work_format' => $company->culture->work_format,
                    'decision_making_style' => $company->culture->decision_making_style,
                    'core_values' => $company->culture->core_values ?? [],
                ] : null,
                'confidential_note' => $company->confidentialNote ? [
                    'notes' => $company->confidentialNote->notes,
                ] : null,
                'executives' => $company->executives->map(fn($e) => [
                    'id' => $e->id,
                    'position_title' => $e->position_title,
                    'number_of_executives' => $e->number_of_executives,
                    'is_custom' => $e->is_custom,
                ]),
                'job_grades' => $company->jobGrades->map(fn($g) => [
                    'id' => $g->id,
                    'grade_name' => $g->grade_name,
                    'grade_order' => $g->grade_order,
                    'promotion_rules' => $g->promotion_rules,
                    'promotion_to_grade' => $g->promotion_to_grade,
                ]),
                'organizational_charts' => $company->organizationalCharts->map(fn($c) => [
                    'id' => $c->id,
                    'chart_year_month' => $c->chart_year_month,
                    'file_path' => $c->file_path ? Storage::url($c->file_path) : null,
                    'file_name' => $c->file_name,
                ]),
                'hr_issues' => $company->hrIssues->map(fn($i) => [
                    'id' => $i->id,
                    'issue_type' => $i->issue_type,
                    'is_custom' => $i->is_custom,
                    'description' => $i->description,
                ]),
                'organization_design' => $company->hrProjects()->first()?->organizationDesign ? [
                    'structure_types' => $company->hrProjects()->first()->organizationDesign->structure_types ?? [],
                ] : null,
            ] : null,
            'activeTab' => $activeTab,
            'stepStatuses' => $stepStatuses,
            ]);
            
            // #region agent log
            $logPath = base_path('.cursor/debug.log');
            file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_after_render','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:372','message'=>'After Inertia render - success','data'=>['renderComponent'=>$renderComponent],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'D'])."\n", FILE_APPEND);
            // #endregion
            
            return $response;
        } catch (\Exception $e) {
            // #region agent log
            $logPath = base_path('.cursor/debug.log');
            file_put_contents($logPath, json_encode(['id'=>'log_'.time().'_error','timestamp'=>time()*1000,'location'=>'DiagnosisWizardController.php:378','message'=>'Exception caught','data'=>['error'=>$e->getMessage(),'file'=>$e->getFile(),'line'=>$e->getLine(),'renderComponent'=>$renderComponent],'sessionId'=>'debug-session','runId'=>'run1','hypothesisId'=>'C'])."\n", FILE_APPEND);
            // #endregion
            throw $e;
        }
    }

    /**
     * Start the diagnosis process - redirect to company-info tab
     * Company will be created on final submit, so no need to create/update here
     */
    public function start(): RedirectResponse
    {
        $user = Auth::user();
        $company = $user->companies()->first();
        
        if (!$company) {
            return redirect()->route('companies.create');
        }
        
        // Simply redirect to company-info tab
        return redirect()->route('hr-manager.diagnosis.tab', ['tab' => 'company-info']);
    }
    
    /**
     * Continue diagnosis - Create/update HR Project and redirect to first step
     */
    public function continue(int $projectId): RedirectResponse
    {
        $user = Auth::user();
        
        // Get user's company
        $company = $user->companies()->first();
        if (!$company) {
            return redirect()->route('companies.create');
        }
        
        // Find or create HR Project
        $hrProject = $company->hrProjects()->first();
        if (!$hrProject) {
            $hrProject = $company->hrProjects()->create([
                'status' => 'in_progress',
                'current_step' => 'diagnosis',
            ]);
        }
        
        // Ensure project is initialized
        $hrProject->initializeStepStatuses();
        if ($hrProject->status === 'not_started') {
            $hrProject->update([
                'status' => 'in_progress',
                'current_step' => 'diagnosis',
            ]);
        }
        
        // Redirect to company-info tab
        return redirect()->route('hr-manager.diagnosis.tab.with-project', [
            'projectId' => $hrProject->id,
            'tab' => 'company-info'
        ]);
    }

    public function updateCompanyInfo(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'foundation_date' => 'required|date',
            'hq_location' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'industry_sub_category' => 'required|string|max:255',
            'secondary_industries' => 'nullable|array',
            'secondary_industries.*' => 'string|max:255',
            'registration_number' => 'required|string|max:255',
            'public_listing_status' => 'required|boolean',
            'logo' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:2048',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        DB::transaction(function () use ($company, $validated, $request) {
            $company->update([
                'name' => $validated['name'],
                'brand_name' => $validated['brand_name'] ?? null,
                'foundation_date' => $validated['foundation_date'],
                'hq_location' => $validated['hq_location'],
                'industry' => $validated['industry'],
                'industry_sub_category' => $validated['industry_sub_category'],
                'secondary_industries' => $validated['secondary_industries'] ?? [],
                'registration_number' => $validated['registration_number'],
                'public_listing_status' => $validated['public_listing_status'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
            ]);
            
            // Get or create HR Project
            $hrProject = $company->hrProjects()->firstOrCreate(
                ['company_id' => $company->id],
                [
                    'status' => 'in_progress',
                    'current_step' => 'diagnosis',
                ]
            );
            
            // Initialize step statuses if not already done
            $hrProject->initializeStepStatuses();
            if ($hrProject->status === 'not_started') {
                $hrProject->update(['status' => 'in_progress']);
            }

            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('company-logos', 'public');
                $company->update(['logo_path' => $path]);
            }

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('company-images', 'public');
                $company->update(['image_path' => $path]);
            }

            // Status should only change when user clicks "Start Company Setup" from overview
            // Don't auto-update status here
        });

        // Get HR Project to redirect to next step
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'business-profile'
            ])->with('success', 'Company information saved successfully.');
        }

        return redirect()->back()->with('success', 'Company information saved successfully.');
    }

    public function updateBusinessProfile(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'annual_revenue' => 'nullable|numeric|min:0',
            'operational_margin_rate' => 'nullable|numeric|min:0|max:100',
            'annual_human_cost' => 'nullable|numeric|min:0',
            'business_type' => 'nullable|in:b2b,b2c,b2b2c',
        ]);

        DB::transaction(function () use ($company, $validated) {
            $company->businessProfile()->updateOrCreate(
                ['company_id' => $company->id],
                $validated
            );

            // Status should only change when user clicks "Start Company Setup" from overview
            // Don't auto-update status here
        });

        // Get HR Project to redirect to next step
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'workforce'
            ])->with('success', 'Business profile saved successfully.');
        }

        return redirect()->back()->with('success', 'Business profile saved successfully.');
    }

    public function updateWorkforce(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'headcount_year_minus_2' => 'nullable|integer|min:0',
            'headcount_year_minus_1' => 'nullable|integer|min:0',
            'headcount_current' => 'required|integer|min:0',
            'total_employees' => 'nullable|integer|min:0',
            'contract_employees' => 'nullable|integer|min:0',
            'expected_workforce_1_year' => 'required|integer|min:0',
            'expected_workforce_2_years' => 'required|integer|min:0',
            'expected_workforce_3_years' => 'required|integer|min:0',
            'average_tenure_active' => 'required|numeric|min:0',
            'average_tenure_leavers' => 'required|numeric|min:0',
            'average_age_active' => 'required|numeric|min:0',
            'male_employees' => 'required|integer|min:0',
            'female_employees' => 'required|integer|min:0',
            'total_leaders_above_team_leader' => 'required|integer|min:0',
            'leaders_percentage' => 'nullable|numeric|min:0|max:100',
            'org_chart' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        DB::transaction(function () use ($company, $validated, $request) {
            $data = $validated;
            
            // Convert string values to appropriate types
            $data['expected_workforce_1_year'] = isset($data['expected_workforce_1_year']) ? (int)$data['expected_workforce_1_year'] : null;
            $data['expected_workforce_2_years'] = isset($data['expected_workforce_2_years']) ? (int)$data['expected_workforce_2_years'] : null;
            $data['expected_workforce_3_years'] = isset($data['expected_workforce_3_years']) ? (int)$data['expected_workforce_3_years'] : null;
            $data['average_tenure_active'] = isset($data['average_tenure_active']) ? (float)$data['average_tenure_active'] : null;
            $data['average_tenure_leavers'] = isset($data['average_tenure_leavers']) ? (float)$data['average_tenure_leavers'] : null;
            $data['average_age_active'] = isset($data['average_age_active']) ? (float)$data['average_age_active'] : null;
            $data['male_employees'] = isset($data['male_employees']) ? (int)$data['male_employees'] : null;
            $data['female_employees'] = isset($data['female_employees']) ? (int)$data['female_employees'] : null;
            $data['total_leaders_above_team_leader'] = isset($data['total_leaders_above_team_leader']) ? (int)$data['total_leaders_above_team_leader'] : null;
            $data['leaders_percentage'] = isset($data['leaders_percentage']) ? (float)$data['leaders_percentage'] : null;
            
            if ($request->hasFile('org_chart')) {
                $path = $request->file('org_chart')->store('org-charts', 'public');
                $data['org_chart_path'] = $path;
                unset($data['org_chart']);
            }

            $company->workforce()->updateOrCreate(
                ['company_id' => $company->id],
                $data
            );

            // Status should only change when user clicks "Start Company Setup" from overview
            // Don't auto-update status here
        });

        // Get HR Project to redirect to next step
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'executives'
            ])->with('success', 'Workforce information saved successfully.');
        }

        return redirect()->back()->with('success', 'Workforce information saved successfully.');
    }

    public function updateCurrentHr(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'dedicated_hr_team' => 'nullable|boolean',
            'labor_union_present' => 'nullable|boolean',
            'labor_relations_stability' => 'nullable|in:stable,moderate,unstable',
            'evaluation_system_status' => 'nullable|in:none,informal,basic,advanced',
            'compensation_system_status' => 'nullable|in:none,informal,basic,advanced',
            'evaluation_system_issues' => 'nullable|string|max:1000',
            'job_rank_levels' => 'nullable|integer|min:0',
            'job_title_levels' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($company, $validated) {
            $company->currentHrStatus()->updateOrCreate(
                ['company_id' => $company->id],
                $validated
            );

            // Status should only change when user clicks "Start Company Setup" from overview
            // Don't auto-update status here
        });

        // Get HR Project to redirect to next step
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'culture'
            ])->with('success', 'Current HR status saved successfully.');
        }

        return redirect()->back()->with('success', 'Current HR status saved successfully.');
    }

    public function updateCulture(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'work_format' => 'nullable|in:on_site,hybrid,remote,flexible',
            'decision_making_style' => 'nullable|in:top_down,collaborative,consensus,decentralized',
            'core_values' => 'nullable|array|max:5',
            'core_values.*' => 'string|max:255',
        ]);

        DB::transaction(function () use ($company, $validated) {
            $company->culture()->updateOrCreate(
                ['company_id' => $company->id],
                $validated
            );

            // Status should only change when user clicks "Start Company Setup" from overview
            // Don't auto-update status here
        });

        // Get HR Project to redirect to next step
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'confidential'
            ])->with('success', 'Culture information saved successfully.');
        }

        return redirect()->back()->with('success', 'Culture information saved successfully.');
    }

    public function updateConfidential(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'notes' => 'nullable|string|max:5000',
        ]);

        DB::transaction(function () use ($company, $validated) {
            $company->confidentialNote()->updateOrCreate(
                ['company_id' => $company->id],
                $validated
            );

            // Status should only change when user clicks "Start Company Setup" from overview
            // Don't auto-update status here
        });

        // Get HR Project to redirect to next step (review)
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'review'
            ])->with('success', 'Confidential notes saved successfully.');
        }

        return redirect()->back()->with('success', 'Confidential notes saved successfully.');
    }

    public function submit(Request $request)
    {
        $user = Auth::user();
        
        // Get existing company or create new one
        $company = $user->companies()->wherePivot('role', 'hr_manager')->first();
        
        if (!$company) {
            // Create company on final submit if it doesn't exist
            $this->authorize('create', Company::class);
        } else {
            $this->authorize('update', $company);
        }

        // Prepare boolean values for validation (convert "1"/"0" strings to booleans)
        $request->merge([
            'executives' => $this->prepareBooleanArray($request->executives ?? [], 'is_custom'),
            'hr_issues' => $this->prepareBooleanArray($request->hr_issues ?? [], 'is_custom'),
        ]);

        // Validate all form data at once
        $validated = $request->validate([
            // Company Info
            'name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'foundation_date' => 'required|date',
            'hq_location' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'industry_sub_category' => 'required|string|max:255',
            'secondary_industries' => 'nullable|array',
            'secondary_industries.*' => 'string|max:255',
            'registration_number' => 'required|string|max:255',
            'public_listing_status' => 'required|boolean',
            'logo' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:2048',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            
            // Business Profile
            'annual_revenue' => 'required|numeric|min:0',
            'operational_margin_rate' => 'nullable|numeric|min:0|max:100',
            'annual_human_cost' => 'nullable|numeric|min:0',
            'business_type' => 'required|in:b2b,b2c,b2b2c',
            
            // Workforce
            'headcount_year_minus_2' => 'nullable|integer|min:0',
            'headcount_year_minus_1' => 'nullable|integer|min:0',
            'headcount_current' => 'required|integer|min:0',
            'total_employees' => 'required|integer|min:0',
            'contract_employees' => 'nullable|integer|min:0',
            'expected_workforce_1_year' => 'required|integer|min:0',
            'expected_workforce_2_years' => 'required|integer|min:0',
            'expected_workforce_3_years' => 'required|integer|min:0',
            'average_tenure_active' => 'required|numeric|min:0',
            'average_tenure_leavers' => 'required|numeric|min:0',
            'average_age_active' => 'required|numeric|min:0',
            'male_employees' => 'required|integer|min:0',
            'female_employees' => 'required|integer|min:0',
            'total_leaders_above_team_leader' => 'required|integer|min:0',
            'leaders_percentage' => 'nullable|numeric|min:0|max:100',
            'org_chart' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            
            // Current HR
            'dedicated_hr_team' => 'required|boolean',
            'labor_union_present' => 'nullable|boolean',
            'labor_relations_stability' => 'required|in:stable,moderate,unstable',
            'evaluation_system_status' => 'nullable|in:none,informal,basic,advanced',
            'compensation_system_status' => 'nullable|in:none,informal,basic,advanced',
            'evaluation_system_issues' => 'nullable|string|max:1000',
            'job_rank_levels' => 'nullable|integer|min:0',
            'job_title_levels' => 'nullable|integer|min:0',
            
            // Culture
            'work_format' => 'required|in:on_site,hybrid,remote,flexible',
            'decision_making_style' => 'required|in:top_down,collaborative,consensus,decentralized',
            'core_values' => 'required|array|min:1|max:5',
            'core_values.*' => 'string|max:255',
            
            // Confidential
            'notes' => 'nullable|string|max:5000',
            
            // Executives
            'executives' => 'required|array|min:1',
            'executives.*.position_title' => 'required|string|max:255',
            'executives.*.number_of_executives' => 'required|integer|min:1',
            'executives.*.is_custom' => 'nullable|boolean',
            
            // Job Grades
            'job_grades' => 'required|array|min:1',
            'job_grades.*.grade_name' => 'required|string|max:255',
            'job_grades.*.grade_order' => 'nullable|integer|min:0',
            'job_grades.*.promotion_rules' => 'nullable|string|max:1000',
            'job_grades.*.promotion_to_grade' => 'nullable|string|max:255',
            
            // Organizational Charts (files)
            'org_chart_2023_12' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'org_chart_2024_12' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'org_chart_2025_12' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            
            // Organizational Structure
            'structure_types' => 'required|array|min:1',
            'structure_types.*' => 'required|in:functional,divisional,project_matrix,hq_subsidiary,no_clearly_defined',
            
            // HR Issues
            'hr_issues' => 'required|array|min:1',
            'hr_issues.*.issue_type' => 'required|string|max:255',
            'hr_issues.*.is_custom' => 'nullable|boolean',
            'hr_issues.*.description' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($user, &$company, $validated, $request) {
            // Create or update Company Info
            if (!$company) {
                // Create new company
                $company = Company::create([
                    'name' => $validated['name'],
                    'brand_name' => $validated['brand_name'] ?? null,
                    'foundation_date' => $validated['foundation_date'],
                    'hq_location' => $validated['hq_location'],
                    'industry' => $validated['industry'],
                    'industry_sub_category' => $validated['industry_sub_category'],
                    'secondary_industries' => $validated['secondary_industries'] ?? [],
                    'registration_number' => $validated['registration_number'],
                    'public_listing_status' => $validated['public_listing_status'],
                    'latitude' => $validated['latitude'] ?? null,
                    'longitude' => $validated['longitude'] ?? null,
                    'created_by' => $user->id,
                    'diagnosis_status' => 'not_started',
                ]);
                
                // Attach user to company
                $company->users()->attach($user->id, ['role' => 'hr_manager']);
            } else {
                // Update existing company
                $company->update([
                    'name' => $validated['name'],
                    'brand_name' => $validated['brand_name'] ?? null,
                    'foundation_date' => $validated['foundation_date'],
                    'hq_location' => $validated['hq_location'],
                    'industry' => $validated['industry'],
                    'industry_sub_category' => $validated['industry_sub_category'],
                    'secondary_industries' => $validated['secondary_industries'] ?? [],
                    'registration_number' => $validated['registration_number'],
                    'public_listing_status' => $validated['public_listing_status'],
                    'latitude' => $validated['latitude'] ?? null,
                    'longitude' => $validated['longitude'] ?? null,
                ]);
            }

            // Handle logo upload
            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('company-logos', 'public');
                $company->update(['logo_path' => $path]);
            }

            // Handle banner image upload
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('company-images', 'public');
                $company->update(['image_path' => $path]);
            }

            // Save Business Profile
            $company->businessProfile()->updateOrCreate(
                ['company_id' => $company->id],
                [
                    'annual_revenue' => $validated['annual_revenue'],
                    'operational_margin_rate' => $validated['operational_margin_rate'] ?? null,
                    'annual_human_cost' => $validated['annual_human_cost'] ?? null,
                    'business_type' => $validated['business_type'],
                ]
            );

            // Save Workforce
            $workforceData = [
                'headcount_year_minus_2' => $validated['headcount_year_minus_2'] ?? null,
                'headcount_year_minus_1' => $validated['headcount_year_minus_1'] ?? null,
                'headcount_current' => $validated['headcount_current'],
                'total_employees' => $validated['total_employees'],
                'contract_employees' => $validated['contract_employees'] ?? null,
                'expected_workforce_1_year' => $validated['expected_workforce_1_year'],
                'expected_workforce_2_years' => $validated['expected_workforce_2_years'],
                'expected_workforce_3_years' => $validated['expected_workforce_3_years'],
                'average_tenure_active' => $validated['average_tenure_active'],
                'average_tenure_leavers' => $validated['average_tenure_leavers'],
                'average_age_active' => $validated['average_age_active'],
                'male_employees' => $validated['male_employees'],
                'female_employees' => $validated['female_employees'],
                'total_leaders_above_team_leader' => $validated['total_leaders_above_team_leader'],
                'leaders_percentage' => $validated['leaders_percentage'] ?? null,
            ];
            
            if ($request->hasFile('org_chart')) {
                $path = $request->file('org_chart')->store('org-charts', 'public');
                $workforceData['org_chart_path'] = $path;
            }
            
            $company->workforce()->updateOrCreate(
                ['company_id' => $company->id],
                $workforceData
            );

            // Save Current HR
            $company->currentHrStatus()->updateOrCreate(
                ['company_id' => $company->id],
                [
                    'dedicated_hr_team' => $validated['dedicated_hr_team'],
                    'labor_union_present' => $validated['labor_union_present'] ?? null,
                    'labor_relations_stability' => $validated['labor_relations_stability'],
                    'evaluation_system_status' => $validated['evaluation_system_status'] ?? null,
                    'compensation_system_status' => $validated['compensation_system_status'] ?? null,
                    'evaluation_system_issues' => $validated['evaluation_system_issues'] ?? null,
                    'job_rank_levels' => $validated['job_rank_levels'] ?? null,
                    'job_title_levels' => $validated['job_title_levels'] ?? null,
                ]
            );

            // Save Culture
            $company->culture()->updateOrCreate(
                ['company_id' => $company->id],
                [
                    'work_format' => $validated['work_format'],
                    'decision_making_style' => $validated['decision_making_style'],
                    'core_values' => $validated['core_values'],
                ]
            );

            // Save Confidential Note (optional)
            if (!empty($validated['notes'])) {
                $company->confidentialNote()->updateOrCreate(
                    ['company_id' => $company->id],
                    ['notes' => $validated['notes']]
                );
            }

            // Save Executives
            $company->executives()->delete();
            foreach ($validated['executives'] as $executiveData) {
                $company->executives()->create([
                    'position_title' => $executiveData['position_title'],
                    'number_of_executives' => $executiveData['number_of_executives'],
                    'is_custom' => $executiveData['is_custom'] ?? false,
                ]);
            }

            // Save Job Grades
            $company->jobGrades()->delete();
            foreach ($validated['job_grades'] as $gradeData) {
                $company->jobGrades()->create([
                    'grade_name' => $gradeData['grade_name'],
                    'grade_order' => $gradeData['grade_order'] ?? null,
                    'promotion_rules' => $gradeData['promotion_rules'] ?? null,
                    'promotion_to_grade' => $gradeData['promotion_to_grade'] ?? null,
                ]);
            }

            // Save Organizational Charts
            // Handle both formats: individual files (org_chart_2023_12) or array format
            if ($request->has('organizational_charts') && is_array($request->organizational_charts)) {
                // Array format from frontend
                foreach ($request->organizational_charts as $chartData) {
                    if (isset($chartData['file']) && $chartData['file'] instanceof \Illuminate\Http\UploadedFile) {
                        $file = $chartData['file'];
                        $yearMonth = $chartData['chart_year_month'] ?? null;
                        if ($yearMonth) {
                            // Convert format (2023-12) to (2023.12)
                            $yearMonthFormatted = str_replace('-', '.', $yearMonth);
                            $path = $file->store('org-charts', 'public');
                            $company->organizationalCharts()->updateOrCreate(
                                [
                                    'company_id' => $company->id,
                                    'chart_year_month' => $yearMonthFormatted,
                                ],
                                [
                                    'file_path' => $path,
                                    'file_name' => $file->getClientOriginalName(),
                                    'file_type' => $file->getClientMimeType(),
                                    'file_size' => $file->getSize(),
                                ]
                            );
                        }
                    }
                }
            } else {
                // Individual file format (org_chart_2023_12, etc.)
                $charts = [
                    '2023.12' => 'org_chart_2023_12',
                    '2024.12' => 'org_chart_2024_12',
                    '2025.12' => 'org_chart_2025_12',
                ];
                foreach ($charts as $yearMonth => $fieldName) {
                    if ($request->hasFile($fieldName)) {
                        $file = $request->file($fieldName);
                        $path = $file->store('org-charts', 'public');
                        $company->organizationalCharts()->updateOrCreate(
                            [
                                'company_id' => $company->id,
                                'chart_year_month' => $yearMonth,
                            ],
                            [
                                'file_path' => $path,
                                'file_name' => $file->getClientOriginalName(),
                                'file_type' => $file->getClientMimeType(),
                                'file_size' => $file->getSize(),
                            ]
                        );
                    }
                }
            }

            // Create or get HR Project for this company (needed for organization_design)
            $hrProject = $company->hrProjects()->firstOrCreate(
                ['company_id' => $company->id],
                [
                    'status' => 'in_progress',
                    'current_step' => 'diagnosis',
                ]
            );

            // Save Organizational Structure (Organization Design)
            $hrProject->organizationDesign()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                ['structure_types' => $validated['structure_types']]
            );

            // Save HR Issues
            $company->hrIssues()->delete();
            foreach ($validated['hr_issues'] as $issueData) {
                $company->hrIssues()->create([
                    'issue_type' => $issueData['issue_type'],
                    'is_custom' => $issueData['is_custom'] ?? false,
                    'description' => $issueData['description'] ?? null,
                ]);
            }
            
            // Initialize step statuses and mark diagnosis as submitted
            $hrProject->initializeStepStatuses();
            $hrProject->setStepStatus('diagnosis', 'submitted');
            // Note: status column is ENUM with values: 'not_started', 'in_progress', 'completed', 'locked', 'pending_consultant_review'
            // We use 'completed' for the main status when diagnosis is fully submitted
            $hrProject->update([
                'current_step' => 'diagnosis',
                'status' => 'completed', // Use 'completed' instead of 'submitted' as per ENUM constraint
            ]);

            // Mark diagnosis as completed
            $company->update([
                'diagnosis_status' => 'completed',
                'overall_status' => 'in_progress',
            ]);
        });

        return redirect('/hr-manager/dashboard')->with('success', 'Diagnosis completed successfully! You can now proceed to the next steps.');
    }

    /**
     * Submit Diagnosis - Mark as completed (all data already saved)
     */
    public function submitDiagnosis(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        DB::transaction(function () use ($company) {
            // Get or create HR Project
            $hrProject = $company->hrProjects()->firstOrCreate(
                ['company_id' => $company->id],
                [
                    'status' => 'in_progress',
                    'current_step' => 'diagnosis',
                ]
            );

            // Initialize step statuses and mark diagnosis as submitted
            $hrProject->initializeStepStatuses();
            $hrProject->setStepStatus('diagnosis', 'submitted');
            $hrProject->update([
                'current_step' => 'organization', // Move to next step after diagnosis
                'status' => 'in_progress',
            ]);

            // Mark diagnosis as completed
            $company->update([
                'diagnosis_status' => 'completed',
                'overall_status' => 'in_progress',
            ]);
        });

        return redirect()->route('dashboard.hr-manager')->with('success', 'Diagnosis completed successfully! You can now proceed to the Organization Design step.');
    }

    /**
     * Update Executives (Task 4)
     */
    public function updateExecutives(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'executives' => 'required|array|min:1',
            'executives.*.position_title' => 'required|string|max:255',
            'executives.*.number_of_executives' => 'required|integer|min:1',
            'executives.*.is_custom' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($company, $validated) {
            // Delete existing executives
            $company->executives()->delete();

            // Create new executives
            foreach ($validated['executives'] as $executiveData) {
                $company->executives()->create([
                    'position_title' => $executiveData['position_title'],
                    'number_of_executives' => $executiveData['number_of_executives'],
                    'is_custom' => $executiveData['is_custom'] ?? false,
                ]);
            }
        });

        // Get HR Project to redirect to next step
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'job-grades'
            ])->with('success', 'Executive information saved successfully.');
        }

        return redirect()->back()->with('success', 'Executive information saved successfully.');
    }

    /**
     * Update Job Grades (Task 6)
     */
    public function updateJobGrades(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'job_grades' => 'required|array|min:1',
            'job_grades.*.grade_name' => 'required|string|max:255',
            'job_grades.*.grade_order' => 'nullable|integer|min:0',
            'job_grades.*.promotion_rules' => 'nullable|string|max:1000',
            'job_grades.*.promotion_to_grade' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($company, $validated) {
            // Delete existing job grades
            $company->jobGrades()->delete();

            // Create new job grades
            foreach ($validated['job_grades'] as $gradeData) {
                $company->jobGrades()->create([
                    'grade_name' => $gradeData['grade_name'],
                    'grade_order' => $gradeData['grade_order'] ?? null,
                    'promotion_rules' => $gradeData['promotion_rules'] ?? null,
                    'promotion_to_grade' => $gradeData['promotion_to_grade'] ?? null,
                ]);
            }
        });

        // Get HR Project to redirect to next step
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'organizational-charts'
            ])->with('success', 'Job grade system saved successfully.');
        }

        return redirect()->back()->with('success', 'Job grade system saved successfully.');
    }

    /**
     * Update Organizational Charts (Task 7)
     */
    public function updateOrganizationalCharts(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'org_chart_2023_12' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'org_chart_2024_12' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'org_chart_2025_12' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        DB::transaction(function () use ($company, $validated, $request) {
            $charts = [
                '2023.12' => 'org_chart_2023_12',
                '2024.12' => 'org_chart_2024_12',
                '2025.12' => 'org_chart_2025_12',
            ];

            foreach ($charts as $yearMonth => $fieldName) {
                if ($request->hasFile($fieldName)) {
                    $file = $request->file($fieldName);
                    $path = $file->store('org-charts', 'public');

                    $company->organizationalCharts()->updateOrCreate(
                        ['chart_year_month' => $yearMonth],
                        [
                            'file_path' => $path,
                            'file_name' => $file->getClientOriginalName(),
                            'file_type' => $file->getClientMimeType(),
                            'file_size' => $file->getSize(),
                        ]
                    );
                }
            }
        });

        // Get HR Project to redirect to next step
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'organizational-structure'
            ])->with('success', 'Organizational charts saved successfully.');
        }

        return redirect()->back()->with('success', 'Organizational charts saved successfully.');
    }

    /**
     * Update Organizational Structure (Task 8)
     */
    public function updateOrganizationalStructure(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'structure_types' => 'required|array|min:1',
            'structure_types.*' => 'required|in:functional,divisional,project_matrix,hq_subsidiary,no_clearly_defined',
        ]);

        DB::transaction(function () use ($company, $validated) {
            // Get or create HR project
            $hrProject = $company->hrProjects()->firstOrCreate(
                ['company_id' => $company->id],
                ['status' => 'in_progress', 'current_step' => 'diagnosis']
            );

            // Update or create organization design
            $hrProject->organizationDesign()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                ['structure_types' => $validated['structure_types']]
            );
        });

        // Get HR Project to redirect to next step
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'hr-issues'
            ])->with('success', 'Organizational structure saved successfully.');
        }

        return redirect()->back()->with('success', 'Organizational structure saved successfully.');
    }

    /**
     * Update HR Issues (Task 9)
     */
    public function updateHrIssues(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'hr_issues' => 'required|array|min:1',
            'hr_issues.*.issue_type' => 'required|string|max:255',
            'hr_issues.*.is_custom' => 'nullable|boolean',
            'hr_issues.*.description' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($company, $validated) {
            // Delete existing HR issues
            $company->hrIssues()->delete();

            // Create new HR issues
            foreach ($validated['hr_issues'] as $issueData) {
                $company->hrIssues()->create([
                    'issue_type' => $issueData['issue_type'],
                    'is_custom' => $issueData['is_custom'] ?? false,
                    'description' => $issueData['description'] ?? null,
                ]);
            }
        });

        // Get HR Project to redirect to next step
        $hrProject = $company->hrProjects()->first();
        if ($hrProject) {
            return redirect()->route('hr-manager.diagnosis.tab.with-project', [
                'projectId' => $hrProject->id,
                'tab' => 'current-hr'
            ])->with('success', 'HR/Org issues saved successfully.');
        }

        return redirect()->back()->with('success', 'HR/Org issues saved successfully.');
    }

    /**
     * Helper method to prepare boolean values in array data for validation
     */
    private function prepareBooleanArray(?array $data, string $booleanKey): array
    {
        if (!is_array($data)) {
            return [];
        }

        return array_map(function ($item) use ($booleanKey) {
            if (is_array($item) && isset($item[$booleanKey])) {
                $value = $item[$booleanKey];
                // Convert "1", "0", "true", "false" strings to actual booleans
                if ($value === '1' || $value === 1 || $value === 'true' || $value === true) {
                    $item[$booleanKey] = true;
                } elseif ($value === '0' || $value === 0 || $value === 'false' || $value === false) {
                    $item[$booleanKey] = false;
                } elseif ($value === null || $value === '') {
                    $item[$booleanKey] = null;
                }
            }
            return $item;
        }, $data);
    }
}
