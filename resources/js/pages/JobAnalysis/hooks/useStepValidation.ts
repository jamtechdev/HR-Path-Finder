import { useMemo } from 'react';
import type { JobAnalysisState } from './useJobAnalysisState';

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export function useStepValidation(state: JobAnalysisState) {
    const validateStep = useMemo(() => {
        return (stepId: string): ValidationResult => {
            switch (stepId) {
                case 'before-you-begin':
                    return { isValid: true, errors: [] };

                case 'policy-snapshot':
                    const unansweredQuestions = Object.keys(state.policyAnswers).length === 0;
                    if (unansweredQuestions) {
                        return {
                            isValid: false,
                            errors: ['Please answer all policy snapshot questions.'],
                        };
                    }
                    return { isValid: true, errors: [] };

                case 'job-list-selection':
                    const hasSelectedJobs = state.jobSelections.selected_job_keyword_ids.length > 0;
                    const hasCustomJobs = state.jobSelections.custom_jobs.length > 0;
                    const hasGroupedJobs = state.jobSelections.grouped_jobs.length > 0;

                    if (!hasSelectedJobs && !hasCustomJobs && !hasGroupedJobs) {
                        return {
                            isValid: false,
                            errors: ['Please select at least one job, add a custom job, or create a grouped job.'],
                        };
                    }
                    return { isValid: true, errors: [] };

                case 'job-definition':
                    // First check if there are any jobs selected
                    const hasAnyJobs = state.jobSelections.selected_job_keyword_ids.length > 0 ||
                                      state.jobSelections.custom_jobs.length > 0 ||
                                      state.jobSelections.grouped_jobs.length > 0;
                    
                    if (!hasAnyJobs) {
                        return {
                            isValid: false,
                            errors: ['Please select jobs first before defining them.'],
                        };
                    }

                    // Check if all selected jobs have definitions
                    const missingDefinitions: string[] = [];
                    
                    // Check individual jobs
                    for (const jobId of state.jobSelections.selected_job_keyword_ids) {
                        const key = `job-${jobId}`;
                        const def = state.jobDefinitions[key];
                        if (!def || !def.job_description) {
                            missingDefinitions.push(`Job ID ${jobId}`);
                        }
                    }

                    // Check custom jobs
                    for (let i = 0; i < state.jobSelections.custom_jobs.length; i++) {
                        const key = `custom-${i}-${state.jobSelections.custom_jobs[i]}`;
                        const def = state.jobDefinitions[key];
                        if (!def || !def.job_description) {
                            missingDefinitions.push(state.jobSelections.custom_jobs[i]);
                        }
                    }

                    // Check grouped jobs
                    for (let i = 0; i < state.jobSelections.grouped_jobs.length; i++) {
                        const group = state.jobSelections.grouped_jobs[i];
                        const sortedIds = [...group.job_keyword_ids].sort((a, b) => a - b).join('-');
                        const key = `group-${sortedIds}-${i}`;
                        const def = state.jobDefinitions[key];
                        if (!def || !def.job_description) {
                            missingDefinitions.push(group.name);
                        }
                    }

                    if (missingDefinitions.length > 0) {
                        return {
                            isValid: false,
                            errors: [`Please complete job definitions for: ${missingDefinitions.join(', ')}`],
                        };
                    }
                    return { isValid: true, errors: [] };

                case 'finalization':
                    // Check if at least one job is finalized
                    const hasJobDefinitions = Object.keys(state.jobDefinitions).length > 0;
                    if (!hasJobDefinitions) {
                        return {
                            isValid: false,
                            errors: ['Please complete at least one job definition before finalizing.'],
                        };
                    }
                    return { isValid: true, errors: [] };

                case 'org-chart-mapping':
                    // Optional step - but should only be marked complete if user has actually visited it
                    // Check if there are any mappings or if step was explicitly completed
                    if (state.stepCompletions['org-chart-mapping']) {
                        return { isValid: true, errors: [] };
                    }
                    // If no mappings exist, it's not completed yet (even though it's optional)
                    if (state.orgMappings.length === 0) {
                        return { isValid: false, errors: [] }; // Optional but not completed
                    }
                    return { isValid: true, errors: [] };

                case 'review-submit':
                    // Check if finalization is completed
                    if (!state.stepCompletions.finalization) {
                        return {
                            isValid: false,
                            errors: ['Please complete finalization before submitting.'],
                        };
                    }
                    return { isValid: true, errors: [] };

                default:
                    return { isValid: true, errors: [] };
            }
        };
    }, [state]);

    const isStepEnabled = useMemo(() => {
        return (stepId: string, stepIndex: number): boolean => {
            // First step is always enabled
            if (stepIndex === 0) return true;

            // Check if previous steps are completed
            const steps = [
                'before-you-begin',
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
