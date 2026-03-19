<?php

namespace App\Services;

use App\Models\BenefitsConfiguration;
use App\Models\BonusPoolConfiguration;
use App\Models\CompensationSystem;
use App\Models\Diagnosis;
use App\Models\HrPolicyOs;
use App\Models\HrProject;
use App\Models\JobDefinition;
use App\Models\OrgChartMapping;
use App\Models\PerformanceSystem;
use App\Models\PolicySnapshotAnswer;
use App\Models\PolicySnapshotQuestion;
use App\Models\BaseSalaryFramework;

class ProjectStageProgressService
{
    private const JOB_ANALYSIS_MICRO_TOTAL = 6;

    /**
     * @return array{
     *     stageProgressPercent: array{
     *         diagnosis: int,
     *         job_analysis: int,
     *         performance: int,
     *         compensation: int,
     *         hr_policy_os: int
     *     },
     *     jobAnalysisMicro: array{completed: int, total: int}
     * }
     */
    public function compute(HrProject $hrProject): array
    {
        $hrProject->loadMissing([
            'diagnosis',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'benefitsConfiguration',
        ]);

        $stepStatuses = $hrProject->step_statuses ?? [];
        $jobAnalysis = $this->computeJobAnalysisMicro($hrProject, $stepStatuses['job_analysis'] ?? 'not_started');

        return [
            'stageProgressPercent' => [
                'diagnosis' => $this->diagnosisPercent($hrProject, $stepStatuses),
                'job_analysis' => $jobAnalysis['percent'],
                'performance' => $this->performancePercent($hrProject, $stepStatuses),
                'compensation' => $this->compensationPercent($hrProject, $stepStatuses),
                'hr_policy_os' => $this->hrPolicyOsPercent($hrProject, $stepStatuses),
            ],
            'jobAnalysisMicro' => [
                'completed' => $jobAnalysis['completed'],
                'total' => self::JOB_ANALYSIS_MICRO_TOTAL,
            ],
        ];
    }

    private function isTerminalStepStatus(?string $status): bool
    {
        return $status !== null
            && $status !== ''
            && in_array($status, ['submitted', 'approved', 'locked', 'completed'], true);
    }

    private function diagnosisPercent(HrProject $hrProject, array $stepStatuses): int
    {
        $status = $stepStatuses['diagnosis'] ?? 'not_started';
        if ($this->isTerminalStepStatus($status)) {
            return 100;
        }
        if ($status === 'not_started' || $status === '') {
            return 0;
        }

        $d = $hrProject->diagnosis;
        if (! $d instanceof Diagnosis) {
            return 0;
        }

        return $this->diagnosisFillRatio($d);
    }

    private function diagnosisFillRatio(Diagnosis $d): int
    {
        $checks = [
            $this->stringFilled($d->industry_category)
                || $this->stringFilled($d->industry_subcategory)
                || $this->stringFilled($d->industry_other),
            $d->present_headcount !== null && $d->present_headcount !== '',
            $d->leadership_percentage !== null,
            ! empty($d->hr_issues) || ! empty($d->custom_hr_issues),
            ! empty($d->organizational_charts),
            ! empty($d->org_structure_types),
            $d->total_executives !== null && $d->total_executives !== '',
            ! empty($d->job_grade_names),
        ];

        $total = count($checks);
        $filled = count(array_filter($checks));

        return (int) round(100 * $filled / max(1, $total));
    }

    /**
     * @return array{completed: int, percent: int}
     */
    private function computeJobAnalysisMicro(HrProject $hrProject, string $jobStatus): array
    {
        if ($this->isTerminalStepStatus($jobStatus)) {
            return ['completed' => self::JOB_ANALYSIS_MICRO_TOTAL, 'percent' => 100];
        }

        $completed = 0;

        $activeIds = PolicySnapshotQuestion::query()->where('is_active', true)->pluck('id');
        if ($activeIds->isEmpty()) {
            $microPolicy = true;
        } else {
            $answers = PolicySnapshotAnswer::query()
                ->where('hr_project_id', $hrProject->id)
                ->whereIn('question_id', $activeIds)
                ->get()
                ->keyBy('question_id');
            $microPolicy = true;
            foreach ($activeIds as $qid) {
                $a = $answers->get($qid);
                if (! $a || trim((string) $a->answer) === '') {
                    $microPolicy = false;
                    break;
                }
            }
        }
        if ($microPolicy) {
            $completed++;
        }

        if (JobDefinition::where('hr_project_id', $hrProject->id)->exists()) {
            $completed++;
        }

        if (JobDefinition::where('hr_project_id', $hrProject->id)
            ->where('is_finalized', false)
            ->whereNotNull('job_description')
            ->whereRaw('LENGTH(TRIM(job_description)) >= ?', [10])
            ->exists()
        ) {
            $completed++;
        }

        if (JobDefinition::where('hr_project_id', $hrProject->id)->where('is_finalized', true)->exists()) {
            $completed++;
        }

        if (OrgChartMapping::where('hr_project_id', $hrProject->id)->exists()) {
            $completed++;
        }

        // Micro-step 6 = whole stage submitted (handled by terminal branch above).

        $percent = (int) round(100 * $completed / self::JOB_ANALYSIS_MICRO_TOTAL);

        return ['completed' => $completed, 'percent' => $percent];
    }

    private function performancePercent(HrProject $hrProject, array $stepStatuses): int
    {
        $status = $stepStatuses['performance'] ?? 'not_started';
        if ($this->isTerminalStepStatus($status)) {
            return 100;
        }
        if ($status === 'not_started' || $status === '') {
            return 0;
        }

        $p = $hrProject->performanceSystem;
        if (! $p instanceof PerformanceSystem) {
            return 0;
        }

        $fields = [
            $p->evaluation_unit,
            $p->performance_method,
            $p->evaluation_logic,
        ];
        $filled = 0;
        foreach ($fields as $v) {
            if ($v !== null && $v !== '') {
                $filled++;
            }
        }

        return (int) round(100 * $filled / count($fields));
    }

    private function compensationPercent(HrProject $hrProject, array $stepStatuses): int
    {
        $status = $stepStatuses['compensation'] ?? 'not_started';
        if ($this->isTerminalStepStatus($status)) {
            return 100;
        }
        if ($status === 'not_started' || $status === '') {
            return 0;
        }

        /** @var CompensationSystem|null $c */
        $c = $hrProject->compensationSystem;
        $bff = BaseSalaryFramework::where('hr_project_id', $hrProject->id)->first();
        /** @var BenefitsConfiguration|null $ben */
        $ben = $hrProject->benefitsConfiguration;
        $bonus = BonusPoolConfiguration::where('hr_project_id', $hrProject->id)->first();

        $checks = [
            $c && $this->stringFilled($c->compensation_structure),
            $c && $this->nonEmptyArray($c->incentive_types),
            $c && $this->stringFilled($c->differentiation_logic),
            $bff && (
                $this->stringFilled($bff->salary_structure_type)
                || $this->stringFilled($bff->salary_adjustment_unit)
                || $this->stringFilled($bff->salary_determination_standard)
            ),
            $ben && (
                $ben->benefits_expense_ratio !== null && $ben->benefits_expense_ratio !== ''
                || $this->nonEmptyArray($ben->current_benefits_programs)
                || $this->nonEmptyArray($ben->benefits_strategic_direction)
            ),
            $bonus && (
                $this->stringFilled($bonus->bonus_pool_determination_criteria)
                || $this->stringFilled($bonus->bonus_pool_determination_method)
            ),
        ];

        $total = count($checks);
        $n = count(array_filter($checks));

        return (int) round(100 * $n / max(1, $total));
    }

    private function hrPolicyOsPercent(HrProject $hrProject, array $stepStatuses): int
    {
        $status = $stepStatuses['hr_policy_os'] ?? 'not_started';
        if ($this->isTerminalStepStatus($status)) {
            return 100;
        }
        if ($status !== 'in_progress') {
            return 0;
        }

        $row = HrPolicyOs::where('hr_project_id', $hrProject->id)->first();
        if (! $row) {
            return 0;
        }

        $sections = [
            $row->policy_manual,
            $row->system_handbook,
            $row->implementation_roadmap,
            $row->analytics_blueprint,
        ];

        $filled = 0;
        foreach ($sections as $sec) {
            if ($this->nonEmptyArray($sec)) {
                $filled++;
            }
        }

        return (int) round(100 * $filled / max(1, count($sections)));
    }

    private function stringFilled(mixed $v): bool
    {
        if ($v === null) {
            return false;
        }
        if (is_string($v)) {
            return trim($v) !== '';
        }

        return true;
    }

    private function nonEmptyArray(mixed $v): bool
    {
        if (! is_array($v) || $v === []) {
            return false;
        }

        foreach ($v as $item) {
            if (is_array($item)) {
                if ($this->nonEmptyArray($item)) {
                    return true;
                }
            } elseif ($item !== null && $item !== '') {
                return true;
            }
        }

        return false;
    }
}
