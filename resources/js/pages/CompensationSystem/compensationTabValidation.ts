import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';
import type {
    BaseSalaryFramework,
    BonusPoolConfiguration,
    BenefitsConfiguration,
    CompensationSnapshotQuestion,
    PayBand,
    PayBandOperationCriteria,
    SalaryTable,
} from './types';

const BONUS_ALLOC_CRITERIA_IDS = ['indiv', 'org', 'grade', 'pos', 'role', 'other'] as const;

export interface CompValidationResult {
    ok: boolean;
    message: string;
    fieldErrors: FieldErrors;
}

function isSnapshotQuestionAnswered(
    q: CompensationSnapshotQuestion,
    responses: Record<number, string[] | string | number | object | null | undefined>
): boolean {
    const r = responses[q.id];

    const numericFromAny = (value: any): number | null => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (typeof value === 'string') {
            const n = parseFloat(value);
            return Number.isFinite(n) ? n : null;
        }
        if (typeof value === 'object') {
            // Handle Decimal/Number objects that may not be plain primitives.
            const v = typeof (value as any).valueOf === 'function' ? (value as any).valueOf() : value;
            if (typeof v === 'number') return Number.isFinite(v) ? v : null;
            if (typeof v === 'string') {
                const n = parseFloat(v);
                return Number.isFinite(n) ? n : null;
            }
            // Fallback: try parsing the string representation.
            const n = parseFloat(String(value));
            return Number.isFinite(n) ? n : null;
        }
        return null;
    };

    if (q.answer_type === 'numeric') {
        const scalar = numericFromAny(r);
        if (scalar !== null) return true;

        // Job functions (stored as an array of {function, amount})
        if (Array.isArray(r)) {
            const isJobFunctions =
                q.metadata?.is_job_functions === true ||
                (q.question_text?.toLowerCase().includes('average salary by job function') ?? false);
            if (isJobFunctions) {
                return (
                    r.length > 0 &&
                    r.every((item) => {
                        if (!item || typeof item !== 'object') return false;
                        const fn = (item as any).function;
                        const amt = (item as any).amount;
                        const amtNum = numericFromAny(amt);
                        return (
                            typeof fn === 'string' &&
                            fn.trim() !== '' &&
                            amtNum !== null
                        );
                    })
                );
            }
            return r.length > 0;
        }

        // Multi-year numeric & years-of-service (stored as objects)
        if (typeof r === 'object' && r !== null) {
            const lower = q.question_text?.toLowerCase() ?? '';
            const isMultiYear =
                q.metadata?.is_multi_year === true ||
                lower.includes('past three years') ||
                lower.includes('average annual salary increase rate') ||
                lower.includes('labor cost ratio') ||
                lower.includes('average bonus payout ratio');
            const isYearsOfService =
                q.metadata?.is_years_of_service === true ||
                lower.includes('average salary by years of service');

            if (isMultiYear) {
                const years = ['2023', '2024', '2025'] as const;
                return years.every((y) => {
                    const v = (r as any)[y];
                    const n = numericFromAny(v);
                    return n !== null;
                });
            }

            if (isYearsOfService) {
                const keys = ['overall', '1_3', '4_7', '8_12', '13_17', '18_20'] as const;
                return keys.every((k) => {
                    const v = (r as any)[k];
                    const n = numericFromAny(v);
                    return n !== null;
                });
            }

            // Generic object numeric: require at least one finite numeric value.
            return Object.values(r as any).some((v) => {
                return numericFromAny(v) !== null;
            });
        }

        return false;
    }
    if (q.answer_type === 'text') {
        return typeof r === 'string' && r.trim() !== '';
    }
    if (Array.isArray(r)) return r.length > 0;
    return r != null && r !== '';
}

export function validateCompensationSnapshot(
    questions: CompensationSnapshotQuestion[],
    responses: Record<number, string[] | string | number | object | null | undefined>
): CompValidationResult {
    const fieldErrors: FieldErrors = {};
    if (!questions?.length) {
        return {
            ok: false,
            message:
                'Compensation snapshot questions are not configured yet. Contact an administrator before continuing.',
            fieldErrors: {
                'comp-snapshot-setup': 'No snapshot questions are available for this project.',
            },
        };
    }
    const q17 = questions[16];
    const q18 = questions[17];
    const q17Selected = Array.isArray(q17 ? responses[q17.id] : null)
        ? ((responses[q17.id] as string[]) ?? [])
        : [];

    for (const q of questions) {
        // Q18 depends on Q17 selections. If Q17 has no usable choices yet,
        // skip Q18 required validation to avoid a false error state.
        if (q18 && q.id === q18.id) {
            const q18Options = Array.isArray(q18.options) ? q18.options : [];
            const hasUsableQ18Options = q17Selected.some((opt) => q18Options.includes(opt));
            if (!hasUsableQ18Options) {
                continue;
            }
        }

        if (!isSnapshotQuestionAnswered(q, responses)) {
            fieldErrors[`comp-q-${q.id}`] = 'This question requires an answer.';
        }
    }
    if (Object.keys(fieldErrors).length > 0) {
        return {
            ok: false,
            message: 'Please answer all compensation snapshot questions before continuing.',
            fieldErrors,
        };
    }
    return { ok: true, message: '', fieldErrors: {} };
}

export function validateBaseSalaryFramework(fw: BaseSalaryFramework): CompValidationResult {
    const fieldErrors: FieldErrors = {};
    if (!(fw.salary_structure_type || '').trim()) {
        fieldErrors['comp-salary-structure-type'] = 'Select a salary structure type.';
    }
    if (!(fw.salary_determination_standard || '').trim()) {
        fieldErrors['comp-salary-determination'] = 'Select or describe how base salary is determined.';
    }
    if (Object.keys(fieldErrors).length > 0) {
        return {
            ok: false,
            message: 'Complete the required fields in Base Salary Framework.',
            fieldErrors,
        };
    }
    return { ok: true, message: '', fieldErrors: {} };
}

function payBandOperationCriteriaComplete(c: PayBandOperationCriteria | undefined): boolean {
    if (!c) return false;
    return (
        String(c.outlier_handling || '').trim() !== '' &&
        String(c.promotion_movement_rule || '').trim() !== '' &&
        String(c.band_review_cycle || '').trim() !== ''
    );
}

function salaryTableHasFilledCell(tables: SalaryTable[]): boolean {
    return (tables ?? []).some((row) =>
        [row.level_1, row.level_2, row.level_3, row.level_4, row.level_5].some(
            (v) => v != null && Number(v) > 0
        )
    );
}

export function validatePayBandTab(
    payBands: PayBand[],
    salaryTables: SalaryTable[],
    framework: BaseSalaryFramework,
    operationCriteria: PayBandOperationCriteria
): CompValidationResult {
    const std = (framework.salary_determination_standard || '').trim();
    if (std === 'pay_band') {
        if ((payBands?.length ?? 0) === 0) {
            return {
                ok: false,
                message: 'Add at least one pay band row before continuing (Pay Band is selected in Base Salary Framework).',
                fieldErrors: {
                    'comp-pay-band': 'Add pay band data for the selected determination method.',
                },
            };
        }
        if (!payBandOperationCriteriaComplete(operationCriteria)) {
            return {
                ok: false,
                message: 'Complete Operation Criteria (outlier handling, promotion rule, and review cycle) before continuing.',
                fieldErrors: {
                    'comp-operation-criteria': 'Select all three operation criteria fields.',
                },
            };
        }
        return { ok: true, message: '', fieldErrors: {} };
    }
    if (std === 'salary_table') {
        if ((salaryTables?.length ?? 0) === 0) {
            return {
                ok: false,
                message: 'Add at least one salary table row before continuing (Salary Table is selected in Base Salary Framework).',
                fieldErrors: {
                    'comp-pay-band': 'Add salary table data for the selected determination method.',
                },
            };
        }
        if (!salaryTableHasFilledCell(salaryTables)) {
            return {
                ok: false,
                message: 'Enter at least one salary amount in the salary table before continuing.',
                fieldErrors: {
                    'comp-pay-band': 'Fill at least one cell in the salary table.',
                },
            };
        }
        if (!payBandOperationCriteriaComplete(operationCriteria)) {
            return {
                ok: false,
                message: 'Complete Operation Criteria before continuing.',
                fieldErrors: {
                    'comp-operation-criteria': 'Select all three operation criteria fields.',
                },
            };
        }
        return { ok: true, message: '', fieldErrors: {} };
    }
    return {
        ok: false,
        message: 'Select Pay Band or Salary Table in Base Salary Framework, then complete the matching section.',
        fieldErrors: {
            'comp-pay-band': 'Complete Base Salary Framework (determination standard) first.',
        },
    };
}

export function validateBonusPoolTab(cfg: BonusPoolConfiguration): CompValidationResult {
    const fieldErrors: FieldErrors = {};
    const trigger = (cfg.payment_trigger_condition || '').trim();
    const criteria = (cfg.bonus_pool_determination_criteria || '').trim();
    const method = (cfg.bonus_pool_determination_method || '').trim();
    const scope = (cfg.eligibility_scope || '').trim();
    const month = cfg.bonus_payment_month;

    const allocationCriteria = cfg.allocation_criteria ?? [];
    const allocationWeights = cfg.allocation_weights ?? {};
    const totalWeight = BONUS_ALLOC_CRITERIA_IDS.filter((id) => allocationCriteria.includes(id)).reduce(
        (sum, id) => sum + (allocationWeights[id] ?? 0),
        0
    );
    const weightOk = allocationCriteria.length === 0 || totalWeight === 100;

    const missing: string[] = [];
    if (!trigger) missing.push('payment trigger');
    if (!criteria) missing.push('determination criteria');
    if (!method) missing.push('determination method');
    if (!scope) missing.push('eligibility scope');
    if (month == null || month < 1 || month > 12) missing.push('bonus payment month');
    if (!weightOk) missing.push('allocation weights must total 100%');

    if (method === 'ratio' && (cfg.ratio_value == null || Number.isNaN(cfg.ratio_value))) {
        missing.push('profit ratio (%)');
    }
    if (
        method === 'range' &&
        (cfg.range_min == null || cfg.range_max == null || Number.isNaN(cfg.range_min) || Number.isNaN(cfg.range_max))
    ) {
        missing.push('bonus pool range (min/max)');
    }
    if (method === 'amount' && (cfg.amount_value == null || Number.isNaN(cfg.amount_value))) {
        missing.push('fixed bonus pool amount');
    }

    if (missing.length > 0) {
        fieldErrors['comp-bonus-pool'] = `Complete bonus pool: ${missing.join(', ')}.`;
        return {
            ok: false,
            message: 'Complete all required Bonus Pool fields before continuing.',
            fieldErrors,
        };
    }
    return { ok: true, message: '', fieldErrors: {} };
}

export function validateBenefitsTab(cfg: BenefitsConfiguration): CompValidationResult {
    const fieldErrors: FieldErrors = {};
    const missing: string[] = [];

    const salaryOk =
        cfg.previous_year_total_salary != null &&
        cfg.previous_year_total_salary > 0 &&
        !Number.isNaN(cfg.previous_year_total_salary);
    const benefitsExpenseOk =
        cfg.previous_year_total_benefits_expense != null &&
        cfg.previous_year_total_benefits_expense > 0 &&
        !Number.isNaN(cfg.previous_year_total_benefits_expense);

    if (!salaryOk) missing.push('total labor cost (100M KRW)');
    if (!benefitsExpenseOk) missing.push('total benefits expense (100M KRW)');

    const stratCount = cfg.benefits_strategic_direction?.length ?? 0;
    if (stratCount < 1) missing.push('at least one strategic direction');
    if (stratCount > 2) missing.push('at most two strategic directions');

    const programCount =
        (cfg.current_benefits_programs?.length ?? 0) + (cfg.future_programs?.length ?? 0);
    if (programCount < 1) missing.push('at least one benefits program (select a card)');

    if (missing.length > 0) {
        fieldErrors['comp-benefits'] = `Complete benefits: ${missing.join('; ')}.`;
        return {
            ok: false,
            message: 'Complete all required Benefits fields before continuing.',
            fieldErrors,
        };
    }
    return { ok: true, message: '', fieldErrors: {} };
}

export function validateCompensationStep(
    tabId: string,
    ctx: {
        snapshotQuestions: CompensationSnapshotQuestion[];
        snapshotResponses: Record<number, string[] | string | number | object | null | undefined>;
        baseSalaryFramework: BaseSalaryFramework;
        payBands: PayBand[];
        salaryTables: SalaryTable[];
        operationCriteria: PayBandOperationCriteria;
        bonusPool: BonusPoolConfiguration;
        benefits: BenefitsConfiguration;
    }
): CompValidationResult {
    switch (tabId) {
        case 'overview':
            return { ok: true, message: '', fieldErrors: {} };
        case 'snapshot':
            return validateCompensationSnapshot(ctx.snapshotQuestions, ctx.snapshotResponses);
        case 'base-salary-framework':
            return validateBaseSalaryFramework(ctx.baseSalaryFramework);
        case 'pay-band-salary-table':
            return validatePayBandTab(
                ctx.payBands,
                ctx.salaryTables,
                ctx.baseSalaryFramework,
                ctx.operationCriteria
            );
        case 'bonus-pool':
            return validateBonusPoolTab(ctx.bonusPool);
        case 'benefits':
            return validateBenefitsTab(ctx.benefits);
        case 'review':
            return { ok: true, message: '', fieldErrors: {} };
        default:
            return { ok: true, message: '', fieldErrors: {} };
    }
}
