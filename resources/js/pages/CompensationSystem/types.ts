export interface PerformanceSystem {
    performance_method?: string;
    evaluation_unit?: string;
}

export interface CompensationSystem {
    id?: number;
    compensation_structure?: string;
    differentiation_logic?: string;
    incentive_types?: string[];
}

export interface ConsultantRecommendation {
    id: number;
    recommended_option: string;
    rationale: string;
    created_at: string;
}

export interface AlgorithmRecommendation {
    score: number;
    reasons: string[];
    recommended: boolean;
}

export interface CompensationSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'multiple' | 'numeric' | 'text';
    options?: string[] | null;
    order: number;
    metadata?: {
        explanation?: string;
        is_multi_year?: boolean;
        is_job_functions?: boolean;
        is_years_of_service?: boolean;
        [key: string]: any;
    };
}

export interface CompensationSnapshotResponse {
    id: number;
    question_id: number;
    response?: string[] | string | null;
    text_response?: string | null;
    numeric_response?: number | null;
    question?: CompensationSnapshotQuestion;
}

export interface BaseSalaryFramework {
    salary_structure_type?: string;
    salary_adjustment_unit?: string;
    salary_adjustment_grouping?: string;
    salary_adjustment_timing?: number[];
    salary_determination_standard?: string;
    common_salary_increase_rate?: string;
    common_increase_rate_basis?: string;
    performance_based_increase_differentiation?: string;
}

export interface PayBand {
    id: number;
    job_grade: string;
    min_salary: number;
    max_salary: number;
    target_salary?: number;
    width?: number;
    factor_a?: number;
    factor_b?: number;
    min_setting_rate_1_2?: number;
    min_setting_rate_3_plus?: number;
    target_rate_increase_1_2?: number;
    target_rate_increase_3_plus?: number;
    order?: number;
    zones?: PayBandZone[];
}

export interface PayBandZone {
    id: number;
    zone_type: 'low' | 'middle' | 'high';
    min_value: number;
    max_value: number;
    percentage: number;
}

export interface SalaryTable {
    id: number;
    job_role: string;
    grade: string;
    years_in_grade: number;
    level_1?: number;
    level_2?: number;
    level_3?: number;
    level_4?: number;
    level_5?: number;
    explanation?: string;
    order?: number;
    performanceIncreases?: SalaryTablePerformanceIncrease[];
}

export interface SalaryTablePerformanceIncrease {
    id: number;
    rating: 'S' | 'A' | 'B' | 'C' | 'D';
    increase_amount: number;
}

export interface PayBandOperationCriteria {
    outlier_handling?: string;
    promotion_movement_rule?: string;
    band_review_cycle?: string;
}

export interface BonusPoolConfiguration {
    payment_trigger_condition?: string;
    bonus_pool_determination_criteria?: string;
    bonus_pool_determination_method?: string;
    eligibility_scope?: string;
    eligibility_criteria?: string;
    inclusion_of_employees_on_leave?: string;
    bonus_calculation_unit?: string;
    allocation_scope?: string;
    allocation_criteria?: string[];
    bonus_pool_finalization_timing?: number;
    bonus_payment_month?: number;
    calculation_period_start?: string;
    calculation_period_end?: string;
}

export interface BenefitsConfiguration {
    previous_year_total_salary?: number;
    previous_year_total_benefits_expense?: number;
    benefits_expense_ratio?: number;
    benefits_strategic_direction?: Array<{ value: string; priority: 'primary' | 'secondary' }>;
    current_benefits_programs?: Array<{ name: string; status: string }>;
    future_programs?: Array<{ name: string; status: string }>;
}

export interface HrProject {
    id: number;
    company?: {
        name: string;
    } | null;
    performanceSystem?: PerformanceSystem;
    compensation_snapshot_responses?: CompensationSnapshotResponse[];
    base_salary_framework?: BaseSalaryFramework;
    pay_bands?: PayBand[];
    salary_tables?: SalaryTable[];
    pay_band_operation_criteria?: PayBandOperationCriteria;
    bonus_pool_configuration?: BonusPoolConfiguration;
    benefits_configuration?: BenefitsConfiguration;
}
