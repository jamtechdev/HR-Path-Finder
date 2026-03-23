import { useMemo } from 'react';
import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';
import type { JobAnalysisState } from './useJobAnalysisState';

const MIN_JOBS_REQUIRED = 3;

export interface PolicyQuestionMeta {
    id: number;
    order: number;
    has_conditional_text: boolean;
}

export interface StepValidationResult {
    isValid: boolean;
    errors: string[];
    fieldErrors: FieldErrors;
}

function sortedPolicyQuestions(questions: PolicyQuestionMeta[]): PolicyQuestionMeta[] {
    return [...questions].sort((a, b) => a.order - b.order);
}

export function useStepValidation(state: JobAnalysisState, policyQuestions: PolicyQuestionMeta[] = []) {
    const validateStep = useMemo(() => {
        return (stepId: string): StepValidationResult => {
            const empty = (): StepValidationResult => ({ isValid: true, errors: [], fieldErrors: {} });

            switch (stepId) {
                case 'policy-snapshot': {
                    const fieldErrors: FieldErrors = {};
                    const errors: string[] = [];
                    const sorted = sortedPolicyQuestions(policyQuestions);

                    if (sorted.length === 0) {
                        return { isValid: true, errors: [], fieldErrors: {} };
                    }

                    for (const q of sorted) {
                        const a = state.policyAnswers[q.id];
                        const key = `q-${q.id}`;
                        if (!a?.answer) {
                            fieldErrors[key] = 'Please select an answer.';
                            errors.push(`Question ${q.id}: an answer is required.`);
                            continue;
                        }
                        if (q.has_conditional_text && a.answer === 'yes') {
                            const t = (a.conditional_text ?? '').trim();
                            if (!t) {
                                fieldErrors[`${key}-conditional`] = 'Please specify which job(s).';
                                errors.push(`Question ${q.id}: conditional details are required when you answer Yes.`);
                            }
                        }
                    }

                    if (Object.keys(fieldErrors).length > 0) {
                        return {
                            isValid: false,
                            errors: errors.length ? errors : ['Please complete all policy snapshot questions.'],
                            fieldErrors,
                        };
                    }
                    return empty();
                }

                case 'job-list-selection': {
                    const nSel = state.jobSelections.selected_job_keyword_ids.length;
                    const nCustom = state.jobSelections.custom_jobs.length;
                    const nGroup = state.jobSelections.grouped_jobs.length;
                    const total = nSel + nCustom + nGroup;

                    if (total < 1) {
                        return {
                            isValid: false,
                            errors: ['Please select at least one job, add a custom job, or create a grouped job.'],
                            fieldErrors: {
                                'job-selection': 'Select at least one job or add a custom / grouped job.',
                            },
                        };
                    }

                    if (total < MIN_JOBS_REQUIRED) {
                        return {
                            isValid: false,
                            errors: [`Please select at least ${MIN_JOBS_REQUIRED} jobs (selected + custom + grouped).`],
                            fieldErrors: {
                                'job-selection': `Select at least ${MIN_JOBS_REQUIRED} jobs — you have ${total} so far.`,
                            },
                        };
                    }

                    return empty();
                }

                case 'job-definition': {
                    const hasAnyJobs =
                        state.jobSelections.selected_job_keyword_ids.length > 0 ||
                        state.jobSelections.custom_jobs.length > 0 ||
                        state.jobSelections.grouped_jobs.length > 0;

                    if (!hasAnyJobs) {
                        return {
                            isValid: false,
                            errors: ['Please select jobs first before defining them.'],
                            fieldErrors: { 'job-definition': 'Go back and select jobs first.' },
                        };
                    }

                    const fieldErrors: FieldErrors = {};
                    const errors: string[] = [];

                    for (const jobId of state.jobSelections.selected_job_keyword_ids) {
                        const key = `job-${jobId}`;
                        const def = state.jobDefinitions[key];
                        if (!def || !(def.job_description || '').trim()) {
                            fieldErrors[`def-${key}`] = 'Job description is required.';
                            errors.push(`Complete definition for job ID ${jobId}.`);
                        }
                    }

                    for (let i = 0; i < state.jobSelections.custom_jobs.length; i++) {
                        const name = state.jobSelections.custom_jobs[i];
                        const key = `custom-${i}-${name}`;
                        const def = state.jobDefinitions[key];
                        if (!def || !(def.job_description || '').trim()) {
                            fieldErrors[`def-${key}`] = 'Job description is required.';
                            errors.push(`Complete definition for "${name}".`);
                        }
                    }

                    for (let i = 0; i < state.jobSelections.grouped_jobs.length; i++) {
                        const group = state.jobSelections.grouped_jobs[i];
                        const sortedIds = [...group.job_keyword_ids].sort((a, b) => a - b).join('-');
                        const key = `group-${sortedIds}-${i}`;
                        const def = state.jobDefinitions[key];
                        if (!def || !(def.job_description || '').trim()) {
                            fieldErrors[`def-${key}`] = 'Job description is required.';
                            errors.push(`Complete definition for grouped job "${group.name}".`);
                        }
                    }

                    if (Object.keys(fieldErrors).length > 0) {
                        return {
                            isValid: false,
                            errors: errors.length ? errors : ['Please complete all job descriptions.'],
                            fieldErrors,
                        };
                    }
                    return empty();
                }

                case 'finalization': {
                    const jd = validateStep('job-definition');
                    if (!jd.isValid) {
                        return {
                            isValid: false,
                            errors: jd.errors.length ? jd.errors : ['Please complete job definitions before finalizing.'],
                            fieldErrors: { finalization: 'Complete all job definitions on the previous step.' },
                        };
                    }
                    return empty();
                }

                case 'org-chart-mapping': {
                    if (state.stepCompletions['org-chart-mapping']) {
                        return empty();
                    }
                    if (state.orgMappings.length === 0) {
                        return empty();
                    }
                    const fieldErrors: FieldErrors = {};
                    const errors: string[] = [];
                    for (const u of state.orgMappings) {
                        if (!(String(u.org_unit_name ?? '').trim())) {
                            fieldErrors[`unit-${u.id}`] = 'Organizational unit name is required.';
                            errors.push('Every organizational unit needs a name.');
                        }
                    }
                    if (Object.keys(fieldErrors).length > 0) {
                        return {
                            isValid: false,
                            errors: errors.length ? errors : ['Please name every organizational unit.'],
                            fieldErrors,
                        };
                    }
                    return empty();
                }

                case 'review-submit': {
                    if (!state.stepCompletions.finalization) {
                        return {
                            isValid: false,
                            errors: ['Please complete finalization before submitting.'],
                            fieldErrors: {
                                'review-submit': 'Complete the Finalization step before submitting.',
                            },
                        };
                    }
                    return empty();
                }

                default:
                    return empty();
            }
        };
    }, [state, policyQuestions]);

    const isStepEnabled = useMemo(() => {
        return (stepId: string, stepIndex: number): boolean => {
            if (stepIndex === 0) return true;

            const steps = [
                'policy-snapshot',
                'job-list-selection',
                'job-definition',
                'finalization',
                'org-chart-mapping',
                'review-submit',
            ];

            for (let i = 0; i < stepIndex; i++) {
                const prevStepId = steps[i];
                if (!state.stepCompletions[prevStepId]) {
                    const prevValidation = validateStep(prevStepId);
                    if (!prevValidation.isValid) {
                        return false;
                    }
                }
            }

            return true;
        };
    }, [state.stepCompletions, validateStep]);

    return {
        validateStep,
        isStepEnabled,
    };
}
