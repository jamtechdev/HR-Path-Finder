import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import StepHeader from '@/components/StepHeader/StepHeader';
import StepProgress from './components/StepProgress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';
import Overview from './steps/Overview';
import Step0BeforeYouBegin from './steps/Step0BeforeYouBegin';
import Step1PolicySnapshot from './steps/Step1PolicySnapshot';
import Step2JobListSelection from './steps/Step2JobListSelection';
import Step3JobDefinition from './steps/Step3JobDefinition';
import Step4Finalization from './steps/Step4Finalization';
import Step5OrgChartMapping from './steps/Step5OrgChartMapping';
import Step6ReviewSubmit from './steps/Step6ReviewSubmit';
import { useJobAnalysisState } from './hooks/useJobAnalysisState';
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
    introCompleted?: boolean;
    stepStatuses?: any;
    templates?: Record<number | string, any>;
}

const STEPS = [
    { id: 'before-you-begin', name: 'Before You Begin' },
    { id: 'policy-snapshot', name: 'Policy Snapshot' },
    { id: 'job-list-selection', name: 'Job List Selection' },
    { id: 'job-definition', name: 'Job Definition' },
    { id: 'finalization', name: 'Finalization' },
    { id: 'org-chart-mapping', name: 'Org Chart Mapping' },
    { id: 'review-submit', name: 'Review & Submit' },
];

export default function JobAnalysisIndex({
    project,
    activeTab: initialTab = 'before-you-begin',
    introText,
    questions = [],
    policySnapshotAnswers = {},
    suggestedJobs = [],
    finalizedJobDefinitions = [],
    organizationalCharts = {},
    industry,
    sizeRange,
    introCompleted = false,
    stepStatuses = {},
    templates = {},
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

    const { validateStep, isStepEnabled } = useStepValidation(state);

    const [activeStepLocal, setActiveStepLocal] = useState(initialTab);
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

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
                if (validation.isValid && step.id !== 'before-you-begin') {
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

    // Load active step from localStorage or prop
    useEffect(() => {
        // If overview or invalid step, show overview
        const validStep = initialTab === 'overview' || !STEPS.some(s => s.id === initialTab) 
            ? 'overview' 
            : initialTab;
        
        const stored = localStorage.getItem(`job-analysis-step-${project.id}`);
        if (stored && (stored === 'overview' || STEPS.some(s => s.id === stored))) {
            setActiveStepLocal(stored);
            if (stored !== 'overview') {
                setActiveStep(stored);
            }
        } else {
            setActiveStepLocal(validStep);
            if (validStep !== 'overview') {
                setActiveStep(validStep);
            }
        }
    }, [project.id, initialTab, setActiveStep]);

    const handleStepChange = (stepId: string) => {
        const stepIndex = STEPS.findIndex(s => s.id === stepId);
        const currentIndex = STEPS.findIndex(s => s.id === activeStepLocal);

        // If going forward, validate current step
        if (stepIndex > currentIndex) {
            const validation = validateStep(activeStepLocal);
            if (!validation.isValid) {
                const msg = validation.errors?.length ? validation.errors.join(' ') : 'Please complete required fields before continuing.';
                toast({ title: 'Validation error', description: msg, variant: 'destructive' });
                return;
            }
        }

        // Check if step is enabled
        if (!isStepEnabled(stepId, stepIndex)) {
            toast({ title: 'Step locked', description: 'Complete the current step before continuing.', variant: 'destructive' });
            return;
        }

        setActiveStepLocal(stepId);
        setActiveStep(stepId);
        localStorage.setItem(`job-analysis-step-${project.id}`, stepId);

        // Update URL without page reload
        router.get(`/hr-manager/job-analysis/${project.id}/${stepId}`, {}, {
            preserveState: true,
            preserveScroll: false,
        });
    };

    const handleStep0Continue = () => {
        markStepCompleted('before-you-begin');
        router.post(`/hr-manager/job-analysis/${project.id}/intro/store`, {}, {
            onSuccess: () => {
                toast({ title: 'Saved', description: 'Intro step completed.' });
                handleStepChange('policy-snapshot');
            },
            onError: (errors: Record<string, unknown>) => {
                const msg = errors && typeof errors === 'object' && (errors.message ?? Object.values(errors)[0]);
                const desc = Array.isArray(msg) ? msg[0] : String(msg ?? 'Failed to save. Please try again.');
                toast({ title: 'Save failed', description: desc, variant: 'destructive' });
            },
        });
    };

    const handleStep1Continue = () => {
        const policy_answers = Object.entries(state.policyAnswers).map(([questionId, a]) => ({
            question_id: parseInt(questionId, 10),
            answer: a.answer,
            conditional_text: a.conditional_text,
        }));
        router.post(`/hr-manager/job-analysis/${project.id}/policy-snapshot`, { policy_answers }, {
            onSuccess: () => {
                toast({ title: 'Saved', description: 'Policy snapshot saved.' });
                markStepCompleted('policy-snapshot');
                handleStepChange('job-list-selection');
            },
            onError: (errors: Record<string, unknown>) => {
                const msg = errors && typeof errors === 'object' && (errors.message ?? Object.values(errors)[0]);
                const desc = Array.isArray(msg) ? msg[0] : String(msg ?? 'Failed to save.');
                toast({ title: 'Save failed', description: desc, variant: 'destructive' });
            },
        });
    };

    const handleStep2Continue = () => {
        router.post(`/hr-manager/job-analysis/${project.id}/job-list-selection`, { job_selections: state.jobSelections }, {
            onSuccess: () => {
                toast({ title: 'Saved', description: 'Job list saved.' });
                markStepCompleted('job-list-selection');
                handleStepChange('job-definition');
            },
            onError: (errors: Record<string, unknown>) => {
                const msg = errors && typeof errors === 'object' && (errors.message ?? Object.values(errors)[0]);
                const desc = Array.isArray(msg) ? msg[0] : String(msg ?? 'Failed to save.');
                toast({ title: 'Save failed', description: desc, variant: 'destructive' });
            },
        });
    };

    const handleStep3Continue = () => {
        markStepCompleted('job-definition');
        handleStepChange('finalization');
    };

    const handleStep4Continue = () => {
        markStepCompleted('finalization');
        handleStepChange('org-chart-mapping');
    };

    const handleStep5Continue = () => {
        const org_chart_mappings = state.orgMappings.map(u => ({
            org_unit_name: u.org_unit_name,
            job_keyword_ids: u.job_keyword_ids,
            org_head_name: u.org_head_name,
            org_head_rank: u.org_head_rank,
            org_head_title: u.org_head_title,
            org_head_email: u.org_head_email,
            job_specialists: u.job_specialists ?? [],
        }));
        router.post(`/hr-manager/job-analysis/${project.id}/org-chart-mapping`, { org_chart_mappings }, {
            onSuccess: () => {
                toast({ title: 'Saved', description: 'Org chart mapping saved.' });
                markStepCompleted('org-chart-mapping');
                handleStepChange('review-submit');
            },
            onError: (errors: Record<string, unknown>) => {
                const msg = errors && typeof errors === 'object' && (errors.message ?? Object.values(errors)[0]);
                const desc = Array.isArray(msg) ? msg[0] : String(msg ?? 'Failed to save.');
                toast({ title: 'Save failed', description: desc, variant: 'destructive' });
            },
        });
    };

    const handleBack = () => {
        const currentIndex = STEPS.findIndex(s => s.id === activeStep);
        if (currentIndex > 0) {
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

            case 'before-you-begin':
                return (
                    <Step0BeforeYouBegin
                        introText={introText}
                        onContinue={handleStep0Continue}
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

    return (
        <AppLayout>
            <Head title="Job Analysis" />
            <div className="space-y-6">
                <StepHeader
                    title="Job Analysis"
                    subtitle="Define job standards and role expectations for your organization."
                    status={getStatusForHeader()}
                    onBack={() => router.visit('/hr-manager/dashboard')}
                />

                {activeStepLocal !== 'overview' && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <StepProgress
                            steps={STEPS}
                            activeStep={activeStepLocal}
                            completedSteps={completedSteps}
                            onStepClick={handleStepChange}
                        />
                    </div>
                )}

                {activeStepLocal !== 'overview' && !['submitted', 'approved', 'locked'].includes(stepStatuses?.job_analysis || '') && (
                    <Alert className="border-blue-200 bg-blue-50/50 py-2">
                        <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <AlertDescription className="text-sm">
                            Progress is saved on this device until you complete <strong>Finalization</strong> and <strong>Review & Submit</strong>.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="transition-all duration-300 ease-in-out">
                        <div key={activeStepLocal} className={activeStepLocal === 'overview' ? '' : 'animate-in fade-in slide-in-from-right duration-300'}>
                            {renderStep()}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
