import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import StepProgress from './components/StepProgress';
import { Badge } from '@/components/ui/badge';
import InlineErrorSummary from '@/components/forms/InlineErrorSummary';
import { ChevronLeft } from 'lucide-react';
import Overview from './steps/Overview';
import Step1PolicySnapshot from './steps/Step1PolicySnapshot';
import Step2JobListSelection from './steps/Step2JobListSelection';
import Step3JobDefinition from './steps/Step3JobDefinition';
import Step4Finalization from './steps/Step4Finalization';
import Step5OrgChartMapping from './steps/Step5OrgChartMapping';
import Step6ReviewSubmit from './steps/Step6ReviewSubmit';
import { useJobAnalysisState, type OrgChartMapping } from './hooks/useJobAnalysisState';
import { useStepValidation } from './hooks/useStepValidation';

interface Project {
    id: number;
    company?: {
        name: string;
    };
}

interface Question {
    id: number;
    question_text: string;
    order: number;
    has_conditional_text: boolean;
}

interface JobKeyword {
    id: number;
    name: string;
}

interface Props {
    project: Project;
    activeTab?: string;
    introText?: string;
    questions?: Question[];
    policySnapshotAnswers?: Record<number, { answer: string; conditional_text?: string }>;
    suggestedJobs?: JobKeyword[];
    finalizedJobDefinitions?: any[];
    organizationalCharts?: any;
    industry?: string;
    sizeRange?: string;
    diagnosisContext?: {
        industry: string | null;
        sizeRange: string | null;
        jobClassificationStatus: string | null;
        hasFormalFramework: boolean;
    };
    introCompleted?: boolean;
    stepStatuses?: any;
    templates?: Record<number | string, any>;
    /** Server-loaded org chart mappings (from backend). Hydrated into state when present. */
    mappings?: Array<{
        id: number;
        parent_id?: number | null;
        sort_order?: number | null;
        org_unit_name: string;
        job_keyword_ids?: number[];
        org_head_name?: string | null;
        org_head_rank?: string | null;
        org_head_title?: string | null;
        org_head_email?: string | null;
        is_kpi_reviewer?: boolean;
        job_specialists?: Array<{ job_keyword_id?: number; name?: string; rank?: string; title?: string; email?: string }>;
    }>;
}

const STEPS = [
    { id: 'policy-snapshot', name: 'Policy Snapshot' },
    { id: 'job-list-selection', name: 'Job List Selection' },
    { id: 'job-definition', name: 'Job Definition' },
    { id: 'finalization', name: 'Finalization' },
    { id: 'org-chart-mapping', name: 'Org Chart Mapping' },
    { id: 'review-submit', name: 'Review & Submit' },
];

function normalizeServerMapping(m: {
    id: number;
    parent_id?: number | null;
    sort_order?: number | null;
    org_unit_name: string;
    job_keyword_ids?: number[];
    org_head_name?: string | null;
    org_head_rank?: string | null;
    org_head_title?: string | null;
    org_head_email?: string | null;
    is_kpi_reviewer?: boolean;
    job_specialists?: Array<{ job_keyword_id?: number; name?: string; rank?: string; title?: string; email?: string }>;
}): OrgChartMapping {
    return {
        id: String(m.id),
        parentId: m.parent_id != null ? String(m.parent_id) : null,
        sort_order: m.sort_order ?? undefined,
        org_unit_name: m.org_unit_name ?? '',
        job_keyword_ids: m.job_keyword_ids ?? [],
        org_head_name: m.org_head_name ?? undefined,
        org_head_rank: m.org_head_rank ?? undefined,
        org_head_title: m.org_head_title ?? undefined,
        org_head_email: m.org_head_email ?? undefined,
        is_kpi_reviewer: m.is_kpi_reviewer ?? false,
        job_specialists: (m.job_specialists ?? []).map((s) => ({
            job_keyword_id: s.job_keyword_id ?? 0,
            name: s.name ?? '',
            rank: s.rank,
            title: s.title,
            email: s.email,
        })),
    };
}

export default function JobAnalysisIndex({
    project,
    activeTab: initialTab = 'overview',
    introText,
    questions = [],
    policySnapshotAnswers = {},
    suggestedJobs = [],
    finalizedJobDefinitions = [],
    organizationalCharts = {},
    industry,
    sizeRange,
    diagnosisContext,
    introCompleted = false,
    stepStatuses = {},
    templates = {},
    mappings: serverMappings = [],
}: Props) {
    const {
        state,
        updatePolicyAnswers,
        updateJobSelections,
        updateJobDefinitions,
        updateOrgMappings,
        markStepCompleted,
        setActiveStep,
    } = useJobAnalysisState(project.id);

    // Hydrate org mappings from server when present (e.g. returning to step after save)
    useEffect(() => {
        if (serverMappings.length > 0 && state.orgMappings.length === 0) {
            updateOrgMappings(serverMappings.map(normalizeServerMapping));
        }
    }, [serverMappings.length]);

    const { validateStep, isStepEnabled } = useStepValidation(state);

    const [activeStepLocal, setActiveStepLocal] = useState(initialTab);
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [stepError, setStepError] = useState<string | null>(null);

    // Load initial data into state
    useEffect(() => {
        if (Object.keys(policySnapshotAnswers).length > 0) {
            updatePolicyAnswers(policySnapshotAnswers);
        }
    }, [policySnapshotAnswers, updatePolicyAnswers]);

    // Update completed steps based on state
    useEffect(() => {
        const completed = new Set<string>();
        STEPS.forEach(step => {
            // Only mark as completed if explicitly marked OR if validation passes AND has actual data
            if (state.stepCompletions[step.id]) {
                completed.add(step.id);
            } else {
                const validation = validateStep(step.id);
                // Only mark as completed if validation passes AND step has actual data filled
                if (validation.isValid) {
                    // Additional check: make sure step actually has data
                    let hasData = false;
                    switch (step.id) {
                        case 'policy-snapshot':
                            hasData = Object.keys(state.policyAnswers).length > 0;
                            break;
                        case 'job-list-selection':
                            hasData = state.jobSelections.selected_job_keyword_ids.length > 0 ||
                                     state.jobSelections.custom_jobs.length > 0 ||
                                     state.jobSelections.grouped_jobs.length > 0;
                            break;
                        case 'job-definition':
                            hasData = Object.keys(state.jobDefinitions).length > 0;
                            break;
                        case 'finalization':
                            hasData = state.stepCompletions['job-definition'] || Object.keys(state.jobDefinitions).length > 0;
                            break;
                        case 'org-chart-mapping':
                            // Optional - only mark complete if explicitly completed or has mappings
                            hasData = state.orgMappings.length > 0;
                            break;
                        case 'review-submit':
                            hasData = state.stepCompletions['finalization'] || false;
                            break;
                        default:
                            hasData = false;
                    }
                    if (hasData) {
                        completed.add(step.id);
                    }
                }
            }
        });
        setCompletedSteps(completed);
    }, [state, validateStep]);

    // Load active step from URL first; use localStorage only when URL is a step (not overview)
    useEffect(() => {
        const validStep = initialTab === 'overview' || !STEPS.some(s => s.id === initialTab)
            ? 'overview'
            : initialTab;

        // Overview URL pe hamesha overview dikhao — localStorage se override mat karo
        if (initialTab === 'overview') {
            setActiveStepLocal('overview');
            return;
        }

        const stored = localStorage.getItem(`job-analysis-step-${project.id}`);
        if (stored && STEPS.some(s => s.id === stored)) {
            setActiveStepLocal(stored);
            setActiveStep(stored);
        } else {
            setActiveStepLocal(validStep);
            setActiveStep(validStep);
        }
    }, [project.id, initialTab, setActiveStep]);

    const handleStepChange = (stepId: string) => {
        const stepIndex = STEPS.findIndex(s => s.id === stepId);
        const currentIndex = STEPS.findIndex(s => s.id === activeStepLocal);

        // If going forward, validate current step
        if (stepIndex > currentIndex) {
            const validation = validateStep(activeStepLocal);
            if (!validation.isValid) {
                setStepError(validation.errors?.length ? validation.errors.join(' ') : 'Please complete required fields before continuing.');
                return;
            }
        }

        if (!isStepEnabled(stepId, stepIndex)) {
            setStepError('Complete the current step before continuing.');
            return;
        }
        setStepError(null);

        setActiveStepLocal(stepId);
        setActiveStep(stepId);
        localStorage.setItem(`job-analysis-step-${project.id}`, stepId);

        // Update URL without page reload
        router.get(`/hr-manager/job-analysis/${project.id}/${stepId}`, {}, {
            preserveState: true,
            preserveScroll: false,
        });
    };

    const handleStep1Continue = () => {
        const validation = validateStep('policy-snapshot');
        if (!validation.isValid) {
            setStepError(validation.errors?.join(' ') ?? 'Complete policy snapshot.');
            return;
        }
        setStepError(null);
        markStepCompleted('policy-snapshot');
        handleStepChange('job-list-selection');
    };

    const handleStep2Continue = () => {
        const validation = validateStep('job-list-selection');
        if (!validation.isValid) {
            setStepError(validation.errors?.join(' ') ?? 'Complete job list selection.');
            return;
        }
        setStepError(null);
        markStepCompleted('job-list-selection');
        handleStepChange('job-definition');
    };

    const handleStep3Continue = () => {
        markStepCompleted('job-definition');
        handleStepChange('finalization');
    };

    const handleStep4Continue = () => {
        markStepCompleted('finalization');
        handleStepChange('org-chart-mapping');
    };

    const handleStep5Continue = (mappings?: OrgChartMapping[]) => {
        const list = mappings ?? state.orgMappings;
        const hasEmptyName = list.some(u => !(String(u.org_unit_name ?? '').trim()));
        if (hasEmptyName) {
            setStepError('Please enter a name for every organizational unit.');
            return;
        }
        setStepError(null);
        markStepCompleted('org-chart-mapping');
        handleStepChange('review-submit');
    };

    const handleBack = () => {
        const currentIndex = STEPS.findIndex(s => s.id === activeStepLocal);
        if (currentIndex <= 0) {
            setActiveStepLocal('overview');
            setActiveStep('overview');
            localStorage.setItem(`job-analysis-step-${project.id}`, 'overview');
            router.get(`/hr-manager/job-analysis/${project.id}/overview`, {}, { preserveState: true, preserveScroll: false });
        } else {
            handleStepChange(STEPS[currentIndex - 1].id);
        }
    };

    const renderStep = () => {
        switch (activeStepLocal) {
            case 'overview':
                return (
                    <Overview
                        projectId={project.id}
                        stepStatuses={stepStatuses}
                        completedSteps={completedSteps}
                        onStepClick={handleStepChange}
                    />
                );

            case 'policy-snapshot':
                return (
                    <Step1PolicySnapshot
                        questions={questions}
                        savedAnswers={state.policyAnswers}
                        onAnswersChange={updatePolicyAnswers}
                        onContinue={handleStep1Continue}
                        onBack={handleBack}
                    />
                );

            case 'job-list-selection':
                return (
                    <Step2JobListSelection
                        suggestedJobs={suggestedJobs}
                        jobSelections={state.jobSelections}
                        onSelectionsChange={updateJobSelections}
                        onContinue={handleStep2Continue}
                        onBack={handleBack}
                        industry={industry}
                        sizeRange={sizeRange}
                        diagnosisContext={diagnosisContext}
                    />
                );

            case 'job-definition':
                return (
                    <Step3JobDefinition
                        jobSelections={state.jobSelections}
                        suggestedJobs={suggestedJobs}
                        templates={templates}
                        jobDefinitions={state.jobDefinitions}
                        onDefinitionsChange={updateJobDefinitions}
                        onContinue={handleStep3Continue}
                        onBack={handleBack}
                    />
                );

            case 'finalization':
                return (
                    <Step4Finalization
                        projectId={project.id}
                        jobDefinitions={state.jobDefinitions}
                        orgMappings={state.orgMappings}
                        policyAnswers={state.policyAnswers}
                        jobSelections={state.jobSelections}
                        onContinue={handleStep4Continue}
                        onBack={handleBack}
                    />
                );

            case 'org-chart-mapping':
                return (
                    <Step5OrgChartMapping
                        jobDefinitions={state.jobDefinitions}
                        orgMappings={state.orgMappings}
                        onMappingsChange={updateOrgMappings}
                        onContinue={handleStep5Continue}
                        onBack={handleBack}
                    />
                );

            case 'review-submit':
                return (
                    <Step6ReviewSubmit
                        projectId={project.id}
                        policyAnswers={state.policyAnswers}
                        jobSelections={state.jobSelections}
                        jobDefinitions={state.jobDefinitions}
                        orgMappings={state.orgMappings}
                        questions={questions}
                        onBack={handleBack}
                    />
                );

            default:
                // Default to overview if step not found
                return (
                    <Overview
                        projectId={project.id}
                        stepStatuses={stepStatuses}
                        completedSteps={completedSteps}
                        onStepClick={handleStepChange}
                    />
                );
        }
    };

    const getStatusForHeader = (): 'not_started' | 'in_progress' | 'submitted' => {
        const status = stepStatuses?.job_analysis || 'not_started';
        if (status === 'submitted' || status === 'approved' || status === 'locked') {
            return 'submitted';
        }
        if (status === 'in_progress' || completedSteps.size > 0) {
            return 'in_progress';
        }
        return 'not_started';
    };

    const currentStepIndex = STEPS.findIndex(s => s.id === activeStepLocal);
    const currentStepLabel = currentStepIndex >= 0 ? STEPS[currentStepIndex].name : '';

    return (
        <AppLayout>
            <Head title="Job Analysis" />
            <div className="min-h-full bg-[#f5f3ef]">
                {activeStepLocal === 'overview' ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/hr-manager/dashboard"
                                className="text-sm font-medium text-[#0f2a4a] hover:text-[#1a4070] flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Link>
                        </div>
                        {renderStep()}
                    </div>
                ) : (
                    <>
                        {/* Top header: #151535, P icon, HR Path-Finder / Job Analysis, gold In Progress badge */}
                        <header className="bg-[#151535] text-white flex items-center justify-between flex-wrap gap-2 text-sm" style={{ padding: '14px 40px' }}>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-[#1a1a3d] font-black text-xs shrink-0">P</div>
                                <strong>HR Path-Finder</strong>
                                <span className="opacity-50 font-normal">/ Job Analysis</span>
                            </div>
                            <span
                                className="rounded-[20px] px-3.5 py-1 text-[11px] font-semibold text-white shrink-0"
                                style={{ background: '#c8963e', paddingTop: 4, paddingBottom: 4, paddingLeft: 14, paddingRight: 14 }}
                            >
                                {getStatusForHeader().replace('_', ' ').toUpperCase()}
                            </span>
                        </header>

                        <div className="p-0 space-y-6">
                            <div className="bg-white border-b border-[#e0ddd5] px-4 py-4 flex justify-center" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <StepProgress
                                    steps={STEPS}
                                    activeStep={activeStepLocal}
                                    completedSteps={completedSteps}
                                    onStepClick={handleStepChange}
                                />
                            </div>
                            {stepError && (
                                <div className="px-6 pt-2">
                                    <InlineErrorSummary message={stepError} />
                                </div>
                            )}

                            {['policy-snapshot', 'job-list-selection', 'job-definition', 'finalization', 'org-chart-mapping'].includes(activeStepLocal) ? (
                                <div key={activeStepLocal} className="animate-in fade-in duration-300">
                                    {renderStep()}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="transition-all duration-300 ease-in-out">
                                        <div key={activeStepLocal} className="animate-in fade-in slide-in-from-right duration-300">
                                            {renderStep()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
