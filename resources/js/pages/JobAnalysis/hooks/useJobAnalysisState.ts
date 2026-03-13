import { useState, useEffect, useCallback } from 'react';

export interface PolicyAnswer {
    answer: string;
    conditional_text?: string;
}

export interface JobSelection {
    selected_job_keyword_ids: number[];
    custom_jobs: string[];
    grouped_jobs: Array<{
        name: string;
        job_keyword_ids: number[];
    }>;
}

export interface JobDefinition {
    job_keyword_id?: number;
    job_name: string;
    grouped_job_keyword_ids?: number[];
    job_description?: string;
    job_specification?: {
        education: { required: string; preferred: string };
        experience: { required: string; preferred: string };
        skills: { required: string; preferred: string };
        communication: { required: string; preferred: string };
    };
    competency_levels?: Array<{
        level: string;
        description: string;
    }>;
    csfs?: Array<{
        name: string;
        description: string;
        strategic_importance?: 'high' | 'medium' | 'low';
        category?: 'strategic' | 'process' | 'operational';
    }>;
}

export interface OrgChartMapping {
    id: string;
    parentId?: string | null;
    sort_order?: number;
    depth?: 0 | 1 | 2;
    org_unit_name: string;
    job_keyword_ids: number[];
    org_head_name?: string;
    org_head_rank?: string;
    org_head_title?: string;
    org_head_email?: string;
    is_kpi_reviewer?: boolean;
    job_specialists: Array<{
        job_keyword_id: number;
        name: string;
        rank?: string;
        title?: string;
        email?: string;
    }>;
}

interface JobAnalysisState {
    policyAnswers: Record<number, PolicyAnswer>;
    jobSelections: JobSelection;
    jobDefinitions: Record<string, JobDefinition>;
    orgMappings: OrgChartMapping[];
    stepCompletions: Record<string, boolean>;
    activeStep: string;
}

const STORAGE_KEY_PREFIX = 'job-analysis-state';

export function useJobAnalysisState(projectId: number) {
    const storageKey = `${STORAGE_KEY_PREFIX}-${projectId}`;

    // Initialize state from localStorage or defaults
    const loadState = useCallback((): JobAnalysisState => {
        if (typeof window === 'undefined') {
            return getDefaultState();
        }

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    ...getDefaultState(),
                    ...parsed,
                };
            }
        } catch (error) {
            console.error('Error loading state from localStorage:', error);
        }

        return getDefaultState();
    }, [storageKey]);

    const getDefaultState = (): JobAnalysisState => ({
        policyAnswers: {},
        jobSelections: {
            selected_job_keyword_ids: [],
            custom_jobs: [],
            grouped_jobs: [],
        },
        jobDefinitions: {},
        orgMappings: [],
        stepCompletions: {},
        activeStep: 'overview',
    });

    const [state, setState] = useState<JobAnalysisState>(loadState);

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(storageKey, JSON.stringify(state));
            } catch (error) {
                console.error('Error saving state to localStorage:', error);
            }
        }
    }, [state, storageKey]);

    // Update policy answers
    const updatePolicyAnswers = useCallback((answers: Record<number, PolicyAnswer>) => {
        setState(prev => ({
            ...prev,
            policyAnswers: answers,
        }));
    }, []);

    // Update job selections
    const updateJobSelections = useCallback((selections: JobSelection) => {
        setState(prev => ({
            ...prev,
            jobSelections: selections,
        }));
    }, []);

    // Update job definitions
    const updateJobDefinitions = useCallback((definitions: Record<string, JobDefinition>) => {
        setState(prev => ({
            ...prev,
            jobDefinitions: definitions,
        }));
    }, []);

    // Update org mappings
    const updateOrgMappings = useCallback((mappings: OrgChartMapping[]) => {
        setState(prev => ({
            ...prev,
            orgMappings: mappings,
        }));
    }, []);

    // Mark step as completed
    const markStepCompleted = useCallback((stepId: string) => {
        setState(prev => ({
            ...prev,
            stepCompletions: {
                ...prev.stepCompletions,
                [stepId]: true,
            },
        }));
    }, []);

    // Set active step
    const setActiveStep = useCallback((stepId: string) => {
        setState(prev => ({
            ...prev,
            activeStep: stepId,
        }));
    }, []);

    // Reset state (for testing or reset functionality)
    const resetState = useCallback(() => {
        const defaultState = getDefaultState();
        setState(defaultState);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(storageKey);
        }
    }, [storageKey]);

    return {
        state,
        updatePolicyAnswers,
        updateJobSelections,
        updateJobDefinitions,
        updateOrgMappings,
        markStepCompleted,
        setActiveStep,
        resetState,
    };
}
