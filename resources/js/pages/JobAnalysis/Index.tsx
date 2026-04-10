import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';
import InlineErrorSummary from '@/components/Forms/InlineErrorSummary';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';
import { clearClientDraftCaches } from '@/lib/clientDraftCleanup';
import { pruneFieldErrorsToValidator } from '@/lib/fieldErrorsUtils';
import { toastCopy } from '@/lib/toastCopy';
import StepProgress from './components/StepProgress';
import { useJobAnalysisState, type OrgChartMapping } from './hooks/useJobAnalysisState';
import { useStepValidation } from './hooks/useStepValidation';
import Overview from './steps/Overview';
import Step1PolicySnapshot from './steps/Step1PolicySnapshot';
import Step2JobListSelection from './steps/Step2JobListSelection';
import Step3JobDefinition from './steps/Step3JobDefinition';
import Step4Finalization from './steps/Step4Finalization';
import Step5OrgChartMapping from './steps/Step5OrgChartMapping';
import Step6ReviewSubmit from './steps/Step6ReviewSubmit';

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
    diagnosisSummary?: {
        present_headcount?: number | null;
        job_grade_names?: string[];
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

const JOB_ANALYSIS_STEP_ORDER = [
    'policy-snapshot',
    'job-list-selection',
    'job-definition',
    'finalization',
    'org-chart-mapping',
    'review-submit',
] as const;

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
    diagnosisSummary,
    introCompleted = false,
    stepStatuses = {},
    templates = {},
    mappings: serverMappings = [],
}: Props) {
    const { t, i18n } = useTranslation();
    const steps = useMemo(
        () =>
            JOB_ANALYSIS_STEP_ORDER.map((id) => ({
                id,
                name: t(`hr_job_analysis_page.step_names.${String(id).replace(/-/g, '_')}`),
            })),
        [t, i18n.language],
    );

    const {
        state,
        updatePolicyAnswers,
        updateJobSelections,
        updateJobDefinitions,
        updateOrgMappings,
        markStepCompleted,
        setActiveStep,
        resetState,
    } = useJobAnalysisState(project.id);

    // Hydrate org mappings from server when present (e.g. returning to step after save)
    useEffect(() => {
        if (serverMappings.length > 0 && state.orgMappings.length === 0) {
            updateOrgMappings(serverMappings.map(normalizeServerMapping));
        }
    }, [serverMappings.length]);

    const { validateStep, isStepEnabled } = useStepValidation(state, questions);

    const [activeStepLocal, setActiveStepLocal] = useState(initialTab);
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [stepError, setStepError] = useState<string | null>(null);
    const [stepFieldErrors, setStepFieldErrors] = useState<FieldErrors>({});

    const applyStepValidation = (stepId: string): boolean => {
        const v = validateStep(stepId);
        if (!v.isValid) {
            setStepFieldErrors(v.fieldErrors);
            setStepError(
                v.errors.length ? v.errors.join(' ') : t('hr_job_analysis_page.validation_complete_fields')
            );
            return false;
        }
        setStepFieldErrors({});
        setStepError(null);
        return true;
    };

    // Live: remove each field's error as soon as that field passes validation again.
    useEffect(() => {
        if (activeStepLocal === 'overview') return;
        setStepFieldErrors((prev) => pruneFieldErrorsToValidator(prev, validateStep(activeStepLocal).fieldErrors));
    }, [state, activeStepLocal, validateStep]);

    useEffect(() => {
        if (!stepError) return;
        if (stepError === 'Complete the current step before continuing.') return;
        if (stepError.startsWith('Complete "')) return;
        if (Object.keys(stepFieldErrors).length === 0) {
            setStepError(null);
        }
    }, [stepError, stepFieldErrors]);

    // Load initial data into state
    useEffect(() => {
        if (Object.keys(policySnapshotAnswers).length > 0) {
            updatePolicyAnswers(policySnapshotAnswers);
        }
    }, [policySnapshotAnswers, updatePolicyAnswers]);

    // If overview is opened with no server data, clear stale local draft and show fresh DB/empty state.
    useEffect(() => {
        const hasServerData =
            Object.keys(policySnapshotAnswers ?? {}).length > 0 ||
            (finalizedJobDefinitions?.length ?? 0) > 0 ||
            (serverMappings?.length ?? 0) > 0;

        const status = String((stepStatuses as any)?.job_analysis ?? '').toLowerCase();
        const hasWorkflowProgress =
            status === 'in_progress' || status === 'submitted' || status === 'approved' || status === 'locked' || status === 'completed';

        if (initialTab === 'overview' && !hasServerData && !hasWorkflowProgress) {
            clearClientDraftCaches(project.id);
            resetState();
            setActiveStepLocal('overview');
            setActiveStep('overview');
        }
    }, [
        initialTab,
        project.id,
        policySnapshotAnswers,
        finalizedJobDefinitions,
        serverMappings,
        stepStatuses,
        resetState,
        setActiveStep,
    ]);

    // Update completed steps based on state
    useEffect(() => {
        const completed = new Set<string>();
        steps.forEach(step => {
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
        const validStep = initialTab === 'overview' || !steps.some(s => s.id === initialTab)
            ? 'overview'
            : initialTab;

        // Overview URL pe hamesha overview dikhao — localStorage se override mat karo
        if (initialTab === 'overview') {
            setActiveStepLocal('overview');
            return;
        }

        const stored = localStorage.getItem(`job-analysis-step-${project.id}`);
        if (stored && steps.some(s => s.id === stored)) {
            setActiveStepLocal(stored);
            setActiveStep(stored);
        } else {
            setActiveStepLocal(validStep);
            setActiveStep(validStep);
        }
    }, [project.id, initialTab, setActiveStep]);

    const handleStepChange = (stepId: string) => {
        const stepIndex = steps.findIndex(s => s.id === stepId);
        const currentIndex = steps.findIndex(s => s.id === activeStepLocal);

        // If going forward, validate current step
        if (stepIndex > currentIndex) {
            if (!applyStepValidation(activeStepLocal)) {
                return;
            }
        }

        if (!isStepEnabled(stepId, stepIndex)) {
            setStepFieldErrors({});
            setStepError('Complete the current step before continuing.');
            return;
        }
        setStepError(null);
        setStepFieldErrors({});

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
        if (!applyStepValidation('policy-snapshot')) return;
        markStepCompleted('policy-snapshot');
        toast({
            title: toastCopy.stepCompleted,
            description: 'Policy Snapshot saved. Moving to Job List Selection. 정책 스냅샷이 저장되었습니다.',
            variant: 'success',
            duration: 1800,
        });
        handleStepChange('job-list-selection');
    };

    const handleStep2Continue = () => {
        if (!applyStepValidation('job-list-selection')) return;
        markStepCompleted('job-list-selection');
        toast({
            title: toastCopy.stepCompleted,
            description: 'Job List Selection saved. Moving to Job Definition. 직무 목록 선택이 저장되었습니다.',
            variant: 'success',
            duration: 1800,
        });
        handleStepChange('job-definition');
    };

    const handleStep3Continue = () => {
        if (!applyStepValidation('job-definition')) return;
        markStepCompleted('job-definition');
        toast({
            title: toastCopy.stepCompleted,
            description: 'Job Definition saved. Moving to Finalization. 직무 정의가 저장되었습니다.',
            variant: 'success',
            duration: 1800,
        });
        handleStepChange('finalization');
    };

    const handleStep4Continue = () => {
        if (!applyStepValidation('finalization')) return;
        markStepCompleted('finalization');
        toast({
            title: toastCopy.stepCompleted,
            description: 'Finalization saved. Moving to Org Chart Mapping. 최종 정리가 저장되었습니다.',
            variant: 'success',
            duration: 1800,
        });
        handleStepChange('org-chart-mapping');
    };

    const handleStep5Continue = (mappings?: OrgChartMapping[]) => {
        const list = mappings ?? state.orgMappings;
        const fieldErrors: FieldErrors = {};
        for (const u of list) {
            if (!(String(u.org_unit_name ?? '').trim())) {
                fieldErrors[`unit-${u.id}`] = 'Organizational unit name is required.';
            }
        }
        if (Object.keys(fieldErrors).length > 0) {
            setStepFieldErrors(fieldErrors);
            setStepError('Please enter a name for every organizational unit.');
            return;
        }
        setStepFieldErrors({});
        setStepError(null);
        markStepCompleted('org-chart-mapping');
        toast({
            title: toastCopy.stepCompleted,
            description: 'Org Chart Mapping saved. Moving to Review & Submit. 조직도 매핑이 저장되었습니다.',
            variant: 'success',
            duration: 1800,
        });
        handleStepChange('review-submit');
    };

    const handleBack = () => {
        const currentIndex = steps.findIndex(s => s.id === activeStepLocal);
        if (currentIndex <= 0) {
            setActiveStepLocal('overview');
            setActiveStep('overview');
            localStorage.setItem(`job-analysis-step-${project.id}`, 'overview');
            router.get(`/hr-manager/job-analysis/${project.id}/overview`, {}, { preserveState: true, preserveScroll: false });
        } else {
            handleStepChange(steps[currentIndex - 1].id);
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
                        fieldErrors={stepFieldErrors}
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
                        fieldErrors={stepFieldErrors}
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
                        fieldErrors={stepFieldErrors}
                    />
                );

            case 'finalization':
                return (
                    <Step4Finalization
                        projectId={project.id}
                        jobDefinitions={state.jobDefinitions}
                        orgMappings={state.orgMappings}
                        diagnosisSummary={diagnosisSummary}
                        policyAnswers={state.policyAnswers}
                        jobSelections={state.jobSelections}
                        onContinue={handleStep4Continue}
                        onBack={handleBack}
                        fieldErrors={stepFieldErrors}
                    />
                );

            case 'org-chart-mapping':
                return (
                    <Step5OrgChartMapping
                        jobDefinitions={state.jobDefinitions}
                        jobSelections={state.jobSelections}
                        orgMappings={state.orgMappings}
                        onMappingsChange={updateOrgMappings}
                        onContinue={handleStep5Continue}
                        onBack={handleBack}
                        fieldErrors={stepFieldErrors}
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
                        fieldErrors={stepFieldErrors}
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

    const currentStepIndex = steps.findIndex(s => s.id === activeStepLocal);
    const currentStepLabel = currentStepIndex >= 0 ? steps[currentStepIndex].name : '';

    return (
        <AppLayout>
            <Head title={t('hr_job_analysis_page.page_title')} />
            <div className="job-analysis-theme min-h-full bg-[#f5f3ef] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
                {activeStepLocal === 'overview' ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/hr-manager/dashboard"
                                className="flex items-center gap-1 text-sm font-medium text-[#0f2a4a] hover:text-[#1a4070] dark:text-slate-200 dark:hover:text-white"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {t('hr_job_analysis_page.back_dashboard')}
                            </Link>
                        </div>
                        {renderStep()}
                    </div>
                ) : (
                    <>
                        {/* Top header: #151535, P icon, HR Path-Finder / Job Analysis, gold In Progress badge */}
                        <header className="flex items-center justify-between gap-2 bg-[#151535] px-10 py-[14px] text-sm text-white dark:bg-slate-900" >
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-[#1a1a3d] font-black text-xs shrink-0">P</div>
                                <strong>{t('hr_job_analysis_page.brand')}</strong>
                                <span className="opacity-50 font-normal">{t('hr_job_analysis_page.breadcrumb_suffix')}</span>
                            </div>
                            <span
                                className="shrink-0 rounded-[20px] px-3.5 py-1 text-[11px] font-semibold text-white"
                                style={{ background: '#c8963e', paddingTop: 4, paddingBottom: 4, paddingLeft: 14, paddingRight: 14 }}
                            >
                                {t(`hr_job_analysis_page.header_status.${getStatusForHeader()}`)}
                            </span>
                        </header>

                        <div className="p-0 space-y-6">
                            <div className="flex justify-center border-b border-[#e0ddd5] bg-white px-4 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)] dark:border-slate-700 dark:bg-slate-900">
                                <StepProgress
                                    steps={steps}
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
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
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
