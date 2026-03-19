<?php

namespace App\Services;

use App\Models\HrProject;
use App\Models\JobDefinition;
use App\Models\OrgChartMapping;
use App\Models\BaseSalaryFramework;
use App\Models\PayBand;
use App\Models\SalaryTable;
use App\Models\BonusPoolConfiguration;

class ReportDataService
{
    public function __construct(
        private ProjectStageProgressService $projectStageProgressService
    ) {}

    /**
     * Get comprehensive project data for reports and tree views.
     */
    public function getComprehensiveProjectData(HrProject $hrProject): array
    {
        // Load all relationships
        $hrProject->load([
            'diagnosis',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'company',
            'ceoPhilosophy',
            'benefitsConfiguration',
        ]);

        // Load finalized job definitions
        $jobDefinitions = JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', true)
            ->with('jobKeyword')
            ->get();

        // Load org chart mappings
        $orgChartMappings = OrgChartMapping::where('hr_project_id', $hrProject->id)->get();

        // Map reporting structure to job definitions
        $jobDefinitions = $jobDefinitions->map(function ($job) use ($orgChartMappings) {
            $mapping = $orgChartMappings->first(function ($mapping) use ($job) {
                $jobKeywordIds = $mapping->job_keyword_ids ?? [];
                return in_array($job->job_keyword_id, $jobKeywordIds);
            });

            if ($mapping) {
                $job->reporting_structure = [
                    'executive_director' => $mapping->org_head_name ? 
                        "{$mapping->org_head_title} {$mapping->org_head_name}" : null,
                    'reporting_hierarchy' => $mapping->org_head_rank ? 
                        "Team Leader → {$mapping->org_head_rank} → CEO" : null,
                ];
            }

            if ($job->jobKeyword && $job->jobKeyword->category) {
                $job->job_group = $job->jobKeyword->category;
            }

            return $job;
        });

        // Load compensation system details
        $baseSalaryFramework = BaseSalaryFramework::where('hr_project_id', $hrProject->id)->first();
        $payBands = PayBand::where('hr_project_id', $hrProject->id)->orderBy('order')->get();
        $salaryTables = SalaryTable::where('hr_project_id', $hrProject->id)->orderBy('order')->get();
        $bonusPoolConfig = BonusPoolConfiguration::where('hr_project_id', $hrProject->id)->first();

        // Get step statuses
        $stepStatuses = $hrProject->step_statuses ?? [];
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'job_analysis' => $stepStatuses['job_analysis'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
            'hr_policy_os' => $stepStatuses['hr_policy_os'] ?? 'not_started',
        ];

        // Prepare comprehensive HR System Snapshot Data
        $hrSystemSnapshot = $this->buildHrSystemSnapshot(
            $hrProject,
            $jobDefinitions,
            $baseSalaryFramework,
            $bonusPoolConfig
        );

        $stageProgress = $this->projectStageProgressService->compute($hrProject);

        return [
            'project' => $hrProject,
            'stepStatuses' => $mainStepStatuses,
            'stageProgressPercent' => $stageProgress['stageProgressPercent'],
            'jobDefinitions' => $jobDefinitions,
            'hrSystemSnapshot' => $hrSystemSnapshot,
            'compensationDetails' => [
                'baseSalaryFramework' => $baseSalaryFramework,
                'payBands' => $payBands,
                'salaryTables' => $salaryTables,
                'bonusPoolConfig' => $bonusPoolConfig,
            ],
        ];
    }

    /**
     * Build comprehensive HR System Snapshot from all steps.
     */
    private function buildHrSystemSnapshot(
        HrProject $hrProject,
        $jobDefinitions,
        $baseSalaryFramework,
        $bonusPoolConfig
    ): array {
        $diagnosis = $hrProject->diagnosis;
        $performanceSystem = $hrProject->performanceSystem;
        $compensationSystem = $hrProject->compensationSystem;
        $benefitsConfig = $hrProject->benefitsConfiguration;
        $ceoPhilosophy = $hrProject->ceoPhilosophy;
        $organizationDesign = $hrProject->organizationDesign;

        // Get salary increase process from base salary framework
        $salaryIncreaseProcess = null;
        if ($baseSalaryFramework) {
            $parts = [];
            if ($baseSalaryFramework->salary_adjustment_unit) {
                $parts[] = $baseSalaryFramework->salary_adjustment_unit;
            }
            if ($baseSalaryFramework->salary_adjustment_timing) {
                $timing = is_array($baseSalaryFramework->salary_adjustment_timing) 
                    ? implode(', ', $baseSalaryFramework->salary_adjustment_timing)
                    : $baseSalaryFramework->salary_adjustment_timing;
                if ($timing) {
                    $parts[] = $timing;
                }
            }
            $salaryIncreaseProcess = !empty($parts) ? implode(' - ', $parts) : null;
        }

        // Get welfare program from benefits configuration
        $welfareProgram = null;
        if ($benefitsConfig && $benefitsConfig->current_benefits_programs) {
            $programs = is_array($benefitsConfig->current_benefits_programs)
                ? $benefitsConfig->current_benefits_programs
                : [];
            $welfareProgram = !empty($programs) 
                ? implode(', ', array_column($programs, 'name'))
                : null;
        }

        // Get bonus metric
        $bonusMetric = null;
        if ($bonusPoolConfig) {
            $bonusMetric = $bonusPoolConfig->bonus_pool_determination_criteria ?? 
                          $bonusPoolConfig->bonus_pool_determination_method ?? null;
        }
        if (!$bonusMetric && $compensationSystem && $compensationSystem->incentive_types) {
            $incentives = is_array($compensationSystem->incentive_types)
                ? $compensationSystem->incentive_types
                : [];
            $bonusMetric = !empty($incentives) ? implode(', ', $incentives) : null;
        }

        return [
            'company' => [
                'name' => $hrProject->company->name ?? '',
                'industry' => $diagnosis->industry_category ?? 
                            $diagnosis->industry_subcategory ?? 
                            $diagnosis->industry_other ?? 'N/A',
                'size' => $diagnosis->present_headcount ?? 
                         $diagnosis->total_employees ?? 0,
            ],
            'ceo_philosophy' => [
                'main_trait' => $ceoPhilosophy->main_trait ?? null,
                'secondary_trait' => $ceoPhilosophy->secondary_trait ?? null,
            ],
            'job_architecture' => [
                'jobs_defined' => $jobDefinitions->count(),
                'structure_type' => $organizationDesign->structure_type ?? null,
                'job_grade_structure' => $organizationDesign->job_grade_structure ?? null,
            ],
            'performance_management' => [
                'model' => $performanceSystem->evaluation_unit ?? null,
                'method' => $performanceSystem->performance_method ?? null,
                'cycle' => $performanceSystem->evaluation_cycle ?? null,
                'rating_scale' => $performanceSystem->rating_scale ?? null,
                'evaluation_logic' => $performanceSystem->evaluation_logic ?? null,
            ],
            'compensation_benefits' => [
                'salary_system' => $compensationSystem->compensation_structure ?? null,
                'salary_structure_type' => $baseSalaryFramework->salary_structure_type ?? null,
                'salary_increase_process' => $salaryIncreaseProcess,
                'bonus_metric' => $bonusMetric,
                'benefits_level' => $benefitsConfig->benefits_expense_ratio ?? null,
                'welfare_program' => $welfareProgram,
                'benefits_strategic_direction' => $benefitsConfig->benefits_strategic_direction ?? null,
            ],
            'diagnosis' => [
                'industry_category' => $diagnosis->industry_category ?? null,
                'industry_subcategory' => $diagnosis->industry_subcategory ?? null,
                'present_headcount' => $diagnosis->present_headcount ?? null,
                'expected_headcount_1y' => $diagnosis->expected_headcount_1y ?? null,
                'average_age' => $diagnosis->average_age ?? null,
                'gender_ratio' => $diagnosis->gender_ratio ?? null,
                'total_executives' => $diagnosis->total_executives ?? null,
                'leadership_percentage' => $diagnosis->leadership_percentage ?? null,
            ],
            'hr_system_report' => [
                'status' => $hrProject->isFullyLocked() ? 'Ready' : 'In Progress',
            ],
        ];
    }
}
