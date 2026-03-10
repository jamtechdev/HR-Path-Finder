/**
 * Read/merge job analysis state in localStorage (same key/shape as useJobAnalysisState).
 * Used by Organization Design flow so step navigation without backend save still persists data.
 */
const STORAGE_KEY_PREFIX = 'job-analysis-state';

export function getJobAnalysisStorageKey(projectId: number): string {
    return `${STORAGE_KEY_PREFIX}-${projectId}`;
}

interface PolicyAnswer {
    answer: string;
    conditional_text?: string;
}

interface JobSelection {
    selected_job_keyword_ids: number[];
    custom_jobs: string[];
    grouped_jobs: Array<{ name: string; job_keyword_ids: number[] }>;
}

interface JobDefinition {
    job_keyword_id?: number;
    job_name: string;
    grouped_job_keyword_ids?: number[];
    job_description?: string;
    job_specification?: Record<string, unknown>;
    competency_levels?: Array<{ level: string; description: string }>;
    csfs?: Array<{ name: string; description: string }>;
}

interface OrgChartMapping {
    id: string;
    org_unit_name: string;
    job_keyword_ids: number[];
    org_head_name?: string;
    org_head_rank?: string;
    org_head_title?: string;
    org_head_email?: string;
    job_specialists: Array<{
        job_keyword_id: number;
        name: string;
        rank?: string;
        title?: string;
        email?: string;
    }>;
}

export interface JobAnalysisStoredState {
    policyAnswers?: Record<number, PolicyAnswer>;
    jobSelections?: JobSelection;
    jobDefinitions?: Record<string, JobDefinition>;
    orgMappings?: OrgChartMapping[];
    stepCompletions?: Record<string, boolean>;
    activeStep?: string;
}

const defaultState: JobAnalysisStoredState = {
    policyAnswers: {},
    jobSelections: {
        selected_job_keyword_ids: [],
        custom_jobs: [],
        grouped_jobs: [],
    },
    jobDefinitions: {},
    orgMappings: [],
    stepCompletions: {},
    activeStep: 'before-you-begin',
};

export function readJobAnalysisState(projectId: number): JobAnalysisStoredState {
    if (typeof window === 'undefined') return { ...defaultState };
    try {
        const key = getJobAnalysisStorageKey(projectId);
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored) as JobAnalysisStoredState;
            return { ...defaultState, ...parsed };
        }
    } catch {
        // ignore
    }
    return { ...defaultState };
}

/**
 * Build the payload expected by POST /hr-manager/job-analysis/{id}/submit from stored state + org mappings.
 * Org mappings from the form may use org_head object; we normalize to org_head_* fields.
 */
export function buildSubmitPayload(
    projectId: number,
    orgUnits: Array<{
        org_unit_name: string;
        job_keyword_ids?: number[];
        org_head?: { name?: string; rank?: string; title?: string; email?: string } | null;
        org_head_name?: string;
        org_head_rank?: string;
        org_head_title?: string;
        org_head_email?: string;
        job_specialists?: Array<{
            job_keyword_id: number;
            name: string;
            rank?: string;
            title?: string;
            email?: string;
        }>;
    }>
): {
    policy_answers: Array<{ question_id: number; answer: string; conditional_text?: string }>;
    job_selections: JobSelection;
    job_definitions: JobDefinition[];
    org_chart_mappings: Array<{
        org_unit_name: string;
        job_keyword_ids: number[];
        org_head_name?: string;
        org_head_rank?: string;
        org_head_title?: string;
        org_head_email?: string;
        job_specialists: Array<{
            job_keyword_id: number;
            name: string;
            rank?: string;
            title?: string;
            email?: string;
        }>;
    }>;
} {
    const state = readJobAnalysisState(projectId);
    const policy_answers = Object.entries(state.policyAnswers || {}).map(([questionId, a]) => ({
        question_id: parseInt(questionId, 10),
        answer: a.answer,
        conditional_text: a.conditional_text,
    }));
    const job_selections = state.jobSelections || defaultState.jobSelections!;
    const job_definitions = Object.values(state.jobDefinitions || {});
    const org_chart_mappings = orgUnits
        .filter(u => u.org_unit_name?.trim())
        .map(unit => ({
            org_unit_name: unit.org_unit_name,
            job_keyword_ids: unit.job_keyword_ids || [],
            org_head_name: unit.org_head_name ?? unit.org_head?.name,
            org_head_rank: unit.org_head_rank ?? unit.org_head?.rank,
            org_head_title: unit.org_head_title ?? unit.org_head?.title,
            org_head_email: unit.org_head_email ?? unit.org_head?.email,
            job_specialists: (unit.job_specialists || []).map(s => ({
                job_keyword_id: s.job_keyword_id,
                name: s.name,
                rank: s.rank,
                title: s.title,
                email: s.email,
            })),
        }));
    return { policy_answers, job_selections, job_definitions, org_chart_mappings };
}

/**
 * Build the payload expected by POST /hr-manager/job-analysis/{id}/finalize from stored state.
 */
export function buildFinalizePayload(projectId: number): {
    policy_answers: Array<{ question_id: number; answer: string; conditional_text?: string }>;
    job_selections: JobSelection;
    job_definitions: JobDefinition[];
} {
    const state = readJobAnalysisState(projectId);
    const policy_answers = Object.entries(state.policyAnswers || {}).map(([questionId, a]) => ({
        question_id: parseInt(questionId, 10),
        answer: a.answer,
        conditional_text: a.conditional_text,
    }));
    const job_selections = state.jobSelections || defaultState.jobSelections!;
    const job_definitions = Object.values(state.jobDefinitions || {});
    return { policy_answers, job_selections, job_definitions };
}

export function mergeJobAnalysisState(
    projectId: number,
    partial: Partial<JobAnalysisStoredState>
): void {
    if (typeof window === 'undefined') return;
    try {
        const key = getJobAnalysisStorageKey(projectId);
        const current = readJobAnalysisState(projectId);
        const merged: JobAnalysisStoredState = {
            ...defaultState,
            ...current,
            ...partial,
        };
        localStorage.setItem(key, JSON.stringify(merged));
    } catch {
        // ignore
    }
}
