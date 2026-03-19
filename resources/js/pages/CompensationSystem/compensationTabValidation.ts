import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';
import type {
    BaseSalaryFramework,
    BonusPoolConfiguration,
    BenefitsConfiguration,
    CompensationSnapshotQuestion,
    PayBand,
    SalaryTable,
} from './types';

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
    if (q.answer_type === 'numeric') {
        return r != null && (typeof r === 'number' || (typeof r === 'object' && r !== null));
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
        return { ok: true, message: '', fieldErrors: {} };
    }
    for (const q of questions) {
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

export function validatePayBandTab(payBands: PayBand[], salaryTables: SalaryTable[]): CompValidationResult {
    if ((payBands?.length ?? 0) === 0 && (salaryTables?.length ?? 0) === 0) {
        return {
            ok: false,
            message: 'Add at least one pay band or salary table row before continuing.',
            fieldErrors: {
                'comp-pay-band': 'Define pay bands and/or salary table data.',
            },
        };
    }
    return { ok: true, message: '', fieldErrors: {} };
}

export function validateBonusPoolTab(cfg: BonusPoolConfiguration): CompValidationResult {
    const has =
        (cfg.payment_trigger_condition || '').trim() ||
        (cfg.bonus_pool_determination_criteria || '').trim() ||
        (cfg.bonus_pool_determination_method || '').trim();
    if (!has) {
        return {
            ok: false,
            message: 'Fill in bonus pool criteria or payment trigger before continuing.',
            fieldErrors: {
                'comp-bonus-pool': 'Provide at least one bonus pool configuration field.',
            },
        };
    }
    return { ok: true, message: '', fieldErrors: {} };
}

export function validateBenefitsTab(cfg: BenefitsConfiguration): CompValidationResult {
    const hasNumbers =
        (cfg.previous_year_total_salary != null && cfg.previous_year_total_salary > 0) ||
        (cfg.previous_year_total_benefits_expense != null && cfg.previous_year_total_benefits_expense > 0);
    const hasPrograms =
        (cfg.current_benefits_programs?.length ?? 0) > 0 ||
        (cfg.future_programs?.length ?? 0) > 0 ||
        (cfg.benefits_strategic_direction?.length ?? 0) > 0;
    if (!hasNumbers && !hasPrograms) {
        return {
            ok: false,
            message: 'Add benefits data (e.g. prior-year totals or program selections) before continuing.',
            fieldErrors: {
                'comp-benefits': 'Complete at least one benefits section.',
            },
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
            return validatePayBandTab(ctx.payBands, ctx.salaryTables);
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
