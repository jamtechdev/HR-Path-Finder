import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';

export interface PerfValidationResult {
    valid: boolean;
    message: string;
    fieldErrors: FieldErrors;
}

type SnapshotQuestion = {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'select_all_that_apply';
    options: string[];
    order: number;
};

function isSnapshotQuestionAnswered(
    question: SnapshotQuestion,
    responses: Record<number, { response: string[]; text_response?: string }>
): boolean {
    const data = responses[question.id];
    const selected = data?.response ?? [];
    if (selected.length === 0) return false;
    const hasOther = question.options.some((o) => o.toLowerCase().includes('other'));
    const selectedOther = selected.some((s) => s.toLowerCase().includes('other'));
    if (hasOther && selectedOther) {
        const text = (data?.text_response ?? '').trim();
        if (!text) return false;
    }
    return true;
}

export function validatePerformanceSnapshotTab(
    questions: SnapshotQuestion[],
    responses: Record<number, { response: string[]; text_response?: string }>
): PerfValidationResult {
    const fieldErrors: FieldErrors = {};
    if (!questions?.length) {
        return { valid: true, message: '', fieldErrors: {} };
    }
    for (const q of questions) {
        if (!isSnapshotQuestionAnswered(q, responses)) {
            fieldErrors[`ps-${q.id}`] = 'Please answer this question.';
        }
    }
    if (Object.keys(fieldErrors).length > 0) {
        return {
            valid: false,
            message: 'Please answer all strategic performance snapshot questions.',
            fieldErrors,
        };
    }
    return { valid: true, message: '', fieldErrors: {} };
}

export function validateKpiReviewTab(kpis: unknown[]): PerfValidationResult {
    if (!kpis || kpis.length === 0) {
        return {
            valid: false,
            message: 'Add at least one organizational KPI before continuing.',
            fieldErrors: { 'kpi-list': 'Add at least one KPI or complete the KPI review.' },
        };
    }
    return { valid: true, message: '', fieldErrors: {} };
}

export function validateModelAssignmentTab(
    jobDefinitions: Array<{ id: number }>,
    assignments: Record<number, string>
): PerfValidationResult {
    const fieldErrors: FieldErrors = {};
    const jobs = jobDefinitions ?? [];
    for (const jd of jobs) {
        const id = jd.id;
        const m = String(assignments[id] ?? '').toLowerCase();
        if (m !== 'mbo' && m !== 'bsc' && m !== 'okr') {
            fieldErrors[`model-job-${id}`] = 'Select MBO, BSC, or OKR for this job.';
        }
    }
    if (Object.keys(fieldErrors).length > 0) {
        return {
            valid: false,
            message: 'Assign an evaluation model to every job role.',
            fieldErrors,
        };
    }
    return { valid: true, message: '', fieldErrors: {} };
}

export function validateEvaluationStructureTab(structure: Record<string, unknown> | null | undefined): PerfValidationResult {
    const s = structure ?? {};
    const indMethod = s.individual_evaluation_method;
    const indEvals = (s.individual_evaluators as string[] | undefined) ?? [];

    const fieldErrors: FieldErrors = {};

    if (indEvals.length === 0) {
        fieldErrors['eval-ind-evaluators'] = 'Select at least one individual evaluator type.';
    }
    if (!indMethod) {
        fieldErrors['eval-ind-method'] = 'Select an individual evaluation method (absolute or relative).';
    }

    if (Object.keys(fieldErrors).length > 0) {
        return {
            valid: false,
            message: 'Complete all required fields in Evaluation Structure before continuing.',
            fieldErrors,
        };
    }
    return { valid: true, message: '', fieldErrors: {} };
}
