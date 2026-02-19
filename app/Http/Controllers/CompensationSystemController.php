<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\AdminComment;
use App\Models\HrProject;
use App\Models\CompensationSystem;
use App\Models\CompensationSnapshotQuestion;
use App\Models\CompensationSnapshotResponse;
use App\Models\BaseSalaryFramework;
use App\Models\PayBand;
use App\Models\PayBandZone;
use App\Models\SalaryTable;
use App\Models\SalaryTablePerformanceIncrease;
use App\Models\PayBandOperationCriteria;
use App\Models\BonusPoolConfiguration;
use App\Models\BenefitsConfiguration;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CompensationSystemController extends Controller
{
    public function __construct(
        protected RecommendationService $recommendationService
    ) {
    }

    /**
     * Show compensation system step.
     */
    public function index(Request $request, HrProject $hrProject, ?string $tab = 'overview')
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        // Check if step is unlocked
        if (!$hrProject->isStepUnlocked('compensation')) {
            return back()->withErrors(['error' => 'Compensation System step is not yet unlocked.']);
        }

        $hrProject->load([
            'diagnosis', 
            'organizationDesign', 
            'performanceSystem', 
            'compensationSystem', 
            'organizationalSentiment', 
            'company',
            'compensationSnapshotResponses.question',
            'baseSalaryFramework',
            'payBands.zones',
            'salaryTables.performanceIncreases',
            'payBandOperationCriteria',
            'bonusPoolConfiguration',
            'benefitsConfiguration',
        ]);
        $compensationSystem = $hrProject->compensationSystem;

        // Load snapshot questions
        $snapshotQuestions = CompensationSnapshotQuestion::where('is_active', true)
            ->orderBy('order')
            ->get();

        // Load consultant recommendation
        $consultantRecommendation = AdminComment::where('hr_project_id', $hrProject->id)
            ->where('is_recommendation', true)
            ->where('recommendation_type', 'compensation')
            ->first();

        // Get algorithm-based recommendations
        $algorithmRecommendations = $this->recommendationService->getRecommendedCompensationStructure($hrProject);

        $stepStatuses = $hrProject->step_statuses ?? [];
        $mainStepStatuses = [
            'diagnosis' => $stepStatuses['diagnosis'] ?? 'not_started',
            'job_analysis' => $stepStatuses['job_analysis'] ?? 'not_started',
            'performance' => $stepStatuses['performance'] ?? 'not_started',
            'compensation' => $stepStatuses['compensation'] ?? 'not_started',
            'hr_policy_os' => $stepStatuses['hr_policy_os'] ?? 'not_started',
        ];

        // Use Index component which handles all tabs internally
        return Inertia::render('CompensationSystem/Index', [
            'project' => $hrProject,
            'compensationSystem' => $compensationSystem,
            'consultantRecommendation' => $consultantRecommendation,
            'algorithmRecommendations' => $algorithmRecommendations,
            'stepStatuses' => $mainStepStatuses,
            'activeTab' => $tab,
            'projectId' => $hrProject->id,
            'snapshotQuestions' => $snapshotQuestions,
        ]);
    }

    /**
     * Store compensation system data.
     */
    public function store(Request $request, HrProject $hrProject)
    {
        $tab = $request->input('tab', 'overview');

        if ($tab === 'snapshot') {
            return $this->storeSnapshot($request, $hrProject);
        } elseif ($tab === 'base-salary-framework') {
            return $this->storeBaseSalaryFramework($request, $hrProject);
        } elseif ($tab === 'pay-band') {
            return $this->storePayBand($request, $hrProject);
        } elseif ($tab === 'salary-table') {
            return $this->storeSalaryTable($request, $hrProject);
        } elseif ($tab === 'operation-criteria') {
            return $this->storeOperationCriteria($request, $hrProject);
        } elseif ($tab === 'bonus-pool') {
            return $this->storeBonusPool($request, $hrProject);
        } elseif ($tab === 'benefits') {
            return $this->storeBenefits($request, $hrProject);
        }

        $validated = $request->validate([
            'compensation_structure' => ['nullable', 'array'],
            'differentiation_methods' => ['nullable', 'array'],
            'incentive_components' => ['nullable', 'array'],
        ]);

        $compensationSystem = CompensationSystem::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            array_merge($validated, ['status' => StepStatus::IN_PROGRESS])
        );

        $hrProject->setStepStatus('compensation', StepStatus::IN_PROGRESS);

        $tab = $request->input('tab', 'overview');
        return redirect()->route('hr-manager.compensation-system.index', [$hrProject, $tab])
            ->with('success', 'Compensation system data saved successfully.');
    }

    /**
     * Store compensation snapshot responses.
     */
    protected function storeSnapshot(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'responses' => ['required', 'array'],
            'responses.*.question_id' => ['required', 'exists:compensation_snapshot_questions,id'],
            'responses.*.response' => ['nullable'],
            'responses.*.text_response' => ['nullable', 'string'],
            'responses.*.numeric_response' => ['nullable', 'numeric'],
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            foreach ($validated['responses'] as $responseData) {
                CompensationSnapshotResponse::updateOrCreate(
                    [
                        'hr_project_id' => $hrProject->id,
                        'question_id' => $responseData['question_id'],
                    ],
                    [
                        'response' => $responseData['response'] ?? null,
                        'text_response' => $responseData['text_response'] ?? null,
                        'numeric_response' => $responseData['numeric_response'] ?? null,
                    ]
                );
            }
        });

        $hrProject->setStepStatus('compensation', StepStatus::IN_PROGRESS);

        $tab = $request->input('tab', 'snapshot');
        return redirect()->route('hr-manager.compensation-system.index', [$hrProject, $tab])
            ->with('success', 'Compensation snapshot saved successfully.');
    }

    /**
     * Store base salary framework.
     */
    protected function storeBaseSalaryFramework(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'salary_structure_type' => ['nullable', 'string', 'in:annual_accumulated,annual_non_accumulated,annual_hybrid,seniority_based,job_based'],
            'salary_adjustment_unit' => ['nullable', 'string', 'in:percentage,krw'],
            'salary_adjustment_grouping' => ['nullable', 'string', 'in:single,dual'],
            'salary_adjustment_timing' => ['nullable', 'array'],
            'salary_adjustment_timing.*' => ['integer', 'min:1', 'max:12'],
            'salary_determination_standard' => ['nullable', 'string', 'in:pay_band,salary_table'],
            'common_salary_increase_rate' => ['nullable', 'string', 'in:required,not_required'],
            'common_increase_rate_basis' => ['nullable', 'string', 'in:inflation,company_performance,management_discretion'],
            'performance_based_increase_differentiation' => ['nullable', 'string', 'in:strong,moderate,none'],
        ]);

        BaseSalaryFramework::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            $validated
        );

        $hrProject->setStepStatus('compensation', StepStatus::IN_PROGRESS);

        $tab = $request->input('tab', 'base-salary-framework');
        return redirect()->route('hr-manager.compensation-system.index', [$hrProject, $tab])
            ->with('success', 'Base salary framework saved successfully.');
    }

    /**
     * Store pay band structure and zones.
     */
    protected function storePayBand(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'pay_bands' => ['required', 'array'],
            'pay_bands.*.job_grade' => ['required', 'string'],
            'pay_bands.*.min_salary' => ['required', 'numeric', 'min:0'],
            'pay_bands.*.max_salary' => ['required', 'numeric', 'min:0'],
            'pay_bands.*.target_salary' => ['nullable', 'numeric'],
            'pay_bands.*.width' => ['nullable', 'numeric'],
            'pay_bands.*.factor_a' => ['nullable', 'numeric'],
            'pay_bands.*.factor_b' => ['nullable', 'numeric'],
            'pay_bands.*.min_setting_rate_1_2' => ['nullable', 'numeric'],
            'pay_bands.*.min_setting_rate_3_plus' => ['nullable', 'numeric'],
            'pay_bands.*.target_rate_increase_1_2' => ['nullable', 'numeric'],
            'pay_bands.*.target_rate_increase_3_plus' => ['nullable', 'numeric'],
            'pay_bands.*.order' => ['nullable', 'integer'],
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            // Delete existing pay bands and zones
            PayBand::where('hr_project_id', $hrProject->id)->delete();

            foreach ($validated['pay_bands'] as $index => $payBandData) {
                $payBand = PayBand::create([
                    'hr_project_id' => $hrProject->id,
                    'job_grade' => $payBandData['job_grade'],
                    'min_salary' => $payBandData['min_salary'],
                    'max_salary' => $payBandData['max_salary'],
                    'target_salary' => $payBandData['target_salary'] ?? null,
                    'width' => $payBandData['width'] ?? null,
                    'factor_a' => $payBandData['factor_a'] ?? null,
                    'factor_b' => $payBandData['factor_b'] ?? null,
                    'min_setting_rate_1_2' => $payBandData['min_setting_rate_1_2'] ?? null,
                    'min_setting_rate_3_plus' => $payBandData['min_setting_rate_3_plus'] ?? null,
                    'target_rate_increase_1_2' => $payBandData['target_rate_increase_1_2'] ?? null,
                    'target_rate_increase_3_plus' => $payBandData['target_rate_increase_3_plus'] ?? null,
                    'order' => $payBandData['order'] ?? $index,
                ]);

                // Calculate and create zones (33.33% each)
                $bandRange = $payBandData['max_salary'] - $payBandData['min_salary'];
                $zoneSize = $bandRange / 3;

                PayBandZone::create([
                    'pay_band_id' => $payBand->id,
                    'zone_type' => 'low',
                    'min_value' => $payBandData['min_salary'],
                    'max_value' => $payBandData['min_salary'] + $zoneSize,
                    'percentage' => 33.33,
                ]);

                PayBandZone::create([
                    'pay_band_id' => $payBand->id,
                    'zone_type' => 'middle',
                    'min_value' => $payBandData['min_salary'] + $zoneSize,
                    'max_value' => $payBandData['min_salary'] + ($zoneSize * 2),
                    'percentage' => 33.33,
                ]);

                PayBandZone::create([
                    'pay_band_id' => $payBand->id,
                    'zone_type' => 'high',
                    'min_value' => $payBandData['min_salary'] + ($zoneSize * 2),
                    'max_value' => $payBandData['max_salary'],
                    'percentage' => 33.34,
                ]);
            }
        });

        $hrProject->setStepStatus('compensation', StepStatus::IN_PROGRESS);

        $tab = $request->input('tab', 'pay-band');
        return redirect()->route('hr-manager.compensation-system.index', [$hrProject, $tab])
            ->with('success', 'Pay band structure saved successfully.');
    }

    /**
     * Store salary table data.
     */
    protected function storeSalaryTable(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'salary_tables' => ['required', 'array'],
            'salary_tables.*.job_role' => ['required', 'string'],
            'salary_tables.*.grade' => ['required', 'string'],
            'salary_tables.*.years_in_grade' => ['required', 'integer', 'min:1'],
            'salary_tables.*.level_1' => ['nullable', 'numeric'],
            'salary_tables.*.level_2' => ['nullable', 'numeric'],
            'salary_tables.*.level_3' => ['nullable', 'numeric'],
            'salary_tables.*.level_4' => ['nullable', 'numeric'],
            'salary_tables.*.level_5' => ['nullable', 'numeric'],
            'salary_tables.*.explanation' => ['nullable', 'string'],
            'salary_tables.*.order' => ['nullable', 'integer'],
            'performance_increases' => ['nullable', 'array'],
            'performance_increases.*.rating' => ['required', 'string', 'in:S,A,B,C,D'],
            'performance_increases.*.increase_amount' => ['required', 'numeric'],
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            // Delete existing salary tables and performance increases
            SalaryTable::where('hr_project_id', $hrProject->id)->delete();

            foreach ($validated['salary_tables'] as $index => $tableData) {
                $salaryTable = SalaryTable::create([
                    'hr_project_id' => $hrProject->id,
                    'job_role' => $tableData['job_role'],
                    'grade' => $tableData['grade'],
                    'years_in_grade' => $tableData['years_in_grade'],
                    'level_1' => $tableData['level_1'] ?? null,
                    'level_2' => $tableData['level_2'] ?? null,
                    'level_3' => $tableData['level_3'] ?? null,
                    'level_4' => $tableData['level_4'] ?? null,
                    'level_5' => $tableData['level_5'] ?? null,
                    'explanation' => $tableData['explanation'] ?? null,
                    'order' => $tableData['order'] ?? $index,
                ]);

                // Create performance increases if provided
                if (isset($validated['performance_increases'])) {
                    foreach ($validated['performance_increases'] as $increaseData) {
                        SalaryTablePerformanceIncrease::updateOrCreate(
                            [
                                'salary_table_id' => $salaryTable->id,
                                'rating' => $increaseData['rating'],
                            ],
                            [
                                'increase_amount' => $increaseData['increase_amount'],
                            ]
                        );
                    }
                }
            }
        });

        $hrProject->setStepStatus('compensation', StepStatus::IN_PROGRESS);

        $tab = $request->input('tab', 'salary-table');
        return redirect()->route('hr-manager.compensation-system.index', [$hrProject, $tab])
            ->with('success', 'Salary table saved successfully.');
    }

    /**
     * Store pay band operation criteria.
     */
    protected function storeOperationCriteria(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'outlier_handling' => ['nullable', 'string', 'in:not_allowed,allowed_with_ceo_approval'],
            'promotion_movement_rule' => ['nullable', 'string', 'in:guarantee_minimum,below_minimum_allowed'],
            'band_review_cycle' => ['nullable', 'string', 'in:annual,every_2_years,ad_hoc'],
        ]);

        PayBandOperationCriteria::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            $validated
        );

        $hrProject->setStepStatus('compensation', StepStatus::IN_PROGRESS);

        $tab = $request->input('tab', 'operation-criteria');
        return redirect()->route('hr-manager.compensation-system.index', [$hrProject, $tab])
            ->with('success', 'Operation criteria saved successfully.');
    }

    /**
     * Store bonus pool configuration.
     */
    protected function storeBonusPool(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'payment_trigger_condition' => ['nullable', 'string'],
            'bonus_pool_determination_criteria' => ['nullable', 'string'],
            'bonus_pool_determination_method' => ['nullable', 'string'],
            'eligibility_scope' => ['nullable', 'string'],
            'eligibility_criteria' => ['nullable', 'string'],
            'inclusion_of_employees_on_leave' => ['nullable', 'string'],
            'bonus_calculation_unit' => ['nullable', 'string', 'in:percentage,fixed_amount'],
            'allocation_scope' => ['nullable', 'string'],
            'allocation_criteria' => ['nullable', 'array'],
            'bonus_pool_finalization_timing' => ['nullable', 'integer', 'min:1', 'max:12'],
            'bonus_payment_month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'calculation_period_start' => ['nullable', 'date'],
            'calculation_period_end' => ['nullable', 'date'],
        ]);

        BonusPoolConfiguration::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            $validated
        );

        $hrProject->setStepStatus('compensation', StepStatus::IN_PROGRESS);

        $tab = $request->input('tab', 'bonus-pool');
        return redirect()->route('hr-manager.compensation-system.index', [$hrProject, $tab])
            ->with('success', 'Bonus pool configuration saved successfully.');
    }

    /**
     * Store benefits configuration.
     */
    protected function storeBenefits(Request $request, HrProject $hrProject)
    {
        $validated = $request->validate([
            'previous_year_total_salary' => ['nullable', 'numeric', 'min:0'],
            'previous_year_total_benefits_expense' => ['nullable', 'numeric', 'min:0'],
            'benefits_strategic_direction' => ['nullable', 'array'],
            'current_benefits_programs' => ['nullable', 'array'],
            'future_programs' => ['nullable', 'array'],
        ]);

        // Auto-calculate benefits expense ratio
        if (isset($validated['previous_year_total_salary']) && isset($validated['previous_year_total_benefits_expense'])) {
            if ($validated['previous_year_total_salary'] > 0) {
                $validated['benefits_expense_ratio'] = ($validated['previous_year_total_benefits_expense'] / $validated['previous_year_total_salary']) * 100;
            }
        }

        BenefitsConfiguration::updateOrCreate(
            ['hr_project_id' => $hrProject->id],
            $validated
        );

        $hrProject->setStepStatus('compensation', StepStatus::IN_PROGRESS);

        $tab = $request->input('tab', 'benefits');
        return redirect()->route('hr-manager.compensation-system.index', [$hrProject, $tab])
            ->with('success', 'Benefits configuration saved successfully.');
    }

    /**
     * Submit compensation system.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $compensationSystem = $hrProject->compensationSystem;
        
        if (!$compensationSystem) {
            return back()->withErrors(['error' => 'Please complete the compensation system first.']);
        }

        $hrProject->setStepStatus('compensation', StepStatus::SUBMITTED);

        return back()->with('success', 'Compensation system submitted successfully.');
    }
}
