import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InlineErrorSummary from '@/components/Forms/InlineErrorSummary';
import AppHeader from '@/components/Header/AppHeader';
import CEOSidebar from '@/components/Sidebar/CEOSidebar';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { afterPaint } from '@/lib/deferred';
import { STEPS, MAX_ORGANIZATIONAL_ISSUES } from './constants';
import { usePhilosophyText } from './uiText';
import {
    IntroStep,
    ManagementStep,
    VisionStep,
    GrowthStep,
    LeadershipStep,
    GeneralStep,
    IssuesStep,
    ConcernsStep,
} from './steps';
import type { DiagnosisQuestion, HrIssue, IntroText, SurveyFormData, VisionMissionValue } from './types';

interface Props {
    project: { id: number; company: { name: string } };
    philosophy?: {
        management_philosophy_responses?: Record<string, number>;
        vision_mission_responses?: Record<string, unknown>;
        growth_stage?: string;
        leadership_responses?: Record<string, number>;
        general_responses?: Record<string, number>;
        organizational_issues?: string[];
        organizational_issues_other?: string;
        concerns?: string;
    };
    managementPhilosophyQuestions: DiagnosisQuestion[];
    visionMissionQuestions: DiagnosisQuestion[];
    growthStageQuestion?: DiagnosisQuestion;
    leadershipQuestions: DiagnosisQuestion[];
    generalQuestions: DiagnosisQuestion[];
    concernsQuestion?: DiagnosisQuestion;
    issuesQuestion?: DiagnosisQuestion;
    hrIssues: HrIssue[];
    introText?: IntroText;
    diagnosis?: { hr_issues?: string[] };
    locked?: boolean;
    /** Flashed old input after validation error so form can rehydrate */
    surveyOldInput?: Record<string, unknown>;
}

export default function CeoPhilosophySurvey({
    project,
    philosophy,
    managementPhilosophyQuestions,
    visionMissionQuestions,
    growthStageQuestion,
    leadershipQuestions,
    generalQuestions,
    concernsQuestion,
    issuesQuestion,
    hrIssues,
    introText,
    diagnosis,
    locked = false,
    surveyOldInput,
}: Props) {
    const { t } = useTranslation();
    const { tx, isKo } = usePhilosophyText();
    const [currentStep, setCurrentStep] = useState(0);
    const [currentVisionChunk, setCurrentVisionChunk] = useState(0);
    const [hasSeenIntro, setHasSeenIntro] = useState(false);
    const [hasAgreed, setHasAgreed] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const visionChunkQuestions = (chunkIndex: number) => {
        if (chunkIndex === 0) return visionMissionQuestions.slice(0, 3);
        if (chunkIndex === 1) return visionMissionQuestions.slice(3, 6);
        return visionMissionQuestions.slice(6);
    };

    const initialFormData = useMemo((): SurveyFormData => {
        const fromDb: SurveyFormData = {
            management_philosophy: philosophy?.management_philosophy_responses || {},
            vision_mission: (philosophy?.vision_mission_responses || {}) as Record<string, VisionMissionValue>,
            growth_stage: philosophy?.growth_stage || '',
            leadership: philosophy?.leadership_responses || {},
            general: philosophy?.general_responses || {},
            organizational_issues: philosophy?.organizational_issues ?? [],
            organizational_issues_other: philosophy?.organizational_issues_other || '',
            concerns: philosophy?.concerns || '',
        };
        const old = surveyOldInput as Partial<SurveyFormData> | null | undefined;
        if (!old || typeof old !== 'object' || Object.keys(old).length === 0) return fromDb;
        return {
            management_philosophy: (old.management_philosophy != null && typeof old.management_philosophy === 'object') ? (old.management_philosophy as Record<string, number>) : fromDb.management_philosophy,
            vision_mission: (old.vision_mission != null && typeof old.vision_mission === 'object') ? (old.vision_mission as Record<string, VisionMissionValue>) : fromDb.vision_mission,
            growth_stage: typeof old.growth_stage === 'string' ? old.growth_stage : fromDb.growth_stage,
            leadership: (old.leadership != null && typeof old.leadership === 'object') ? (old.leadership as Record<string, number>) : fromDb.leadership,
            general: (old.general != null && typeof old.general === 'object') ? (old.general as Record<string, number>) : fromDb.general,
            organizational_issues: Array.isArray(old.organizational_issues) ? old.organizational_issues : fromDb.organizational_issues,
            organizational_issues_other: typeof old.organizational_issues_other === 'string' ? old.organizational_issues_other : fromDb.organizational_issues_other,
            concerns: typeof old.concerns === 'string' ? old.concerns : fromDb.concerns,
        };
    }, [philosophy, diagnosis?.hr_issues, surveyOldInput]);

    const { data, setData, post, processing, errors } = useForm<SurveyFormData>(initialFormData);
    const stepRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const didSetInitialStep = useRef(false);
    const stepStorageKey = useMemo(
        () => `ceo-philosophy:step:${project?.id ?? 'default'}`,
        [project?.id],
    );

    // On load/refresh: restore to first incomplete step and treat intro as done if there's saved progress.
    useEffect(() => {
        if (didSetInitialStep.current) return;
        didSetInitialStep.current = true;

        const hasAnySavedProgress = philosophy && (
            (philosophy.management_philosophy_responses && Object.keys(philosophy.management_philosophy_responses).length > 0) ||
            (philosophy.vision_mission_responses && Object.keys(philosophy.vision_mission_responses).length > 0) ||
            !!philosophy.growth_stage?.trim() ||
            (philosophy.leadership_responses && Object.keys(philosophy.leadership_responses).length > 0) ||
            (philosophy.general_responses && Object.keys(philosophy.general_responses).length > 0) ||
            (Array.isArray(philosophy.organizational_issues) && philosophy.organizational_issues.length > 0) ||
            !!philosophy.concerns?.trim()
        );

        const introAgreed = !!hasAnySavedProgress;
        if (introAgreed) setHasAgreed(true);

        const isStepCompleteWith = (i: number, form: SurveyFormData, introOk: boolean): boolean => {
            if (i === 0) return introOk;
            if (i === 1) return managementPhilosophyQuestions.every((q) => {
                const v = form.management_philosophy[q.id.toString()];
                return v != null && !Number.isNaN(Number(v));
            });
            if (i === 2) return visionMissionQuestions.every((q) => {
                const v = form.vision_mission[q.id.toString()];
                return v != null && v !== '';
            });
            if (i === 3) return !!form.growth_stage?.trim();
            if (i === 4) return leadershipQuestions.every((q) => form.leadership[q.id.toString()] != null);
            if (i === 5) return generalQuestions.every((q) => form.general[q.id.toString()] != null);
            if (i === 6) return (form.organizational_issues || []).length >= 1;
            if (i === 7) return !!form.concerns?.trim();
            return false;
        };

        let firstIncomplete = 0;
        for (let i = 0; i < STEPS.length; i++) {
            if (!isStepCompleteWith(i, initialFormData, introAgreed)) {
                firstIncomplete = i;
                break;
            }
            firstIncomplete = i + 1;
        }
        if (firstIncomplete >= STEPS.length) firstIncomplete = STEPS.length - 1;
        let nextStep = firstIncomplete;
        let nextVisionChunk = 0;

        try {
            const raw = window.sessionStorage.getItem(stepStorageKey);
            if (raw) {
                const parsed = JSON.parse(raw) as { step?: number; visionChunk?: number };
                if (typeof parsed.step === 'number' && parsed.step >= 0 && parsed.step < STEPS.length) {
                    nextStep = parsed.step;
                }
                if (typeof parsed.visionChunk === 'number' && parsed.visionChunk >= 0 && parsed.visionChunk <= 2) {
                    nextVisionChunk = parsed.visionChunk;
                }
            }
        } catch {
            // ignore malformed storage data
        }

        setCurrentStep(nextStep);

        if (nextStep === 2) {
            if (nextVisionChunk > 0) {
                setCurrentVisionChunk(nextVisionChunk);
                return;
            }
            for (let c = 0; c < 3; c++) {
                const qs = c === 0 ? visionMissionQuestions.slice(0, 3) : c === 1 ? visionMissionQuestions.slice(3, 6) : visionMissionQuestions.slice(6);
                const chunkComplete = qs.every((q) => {
                    const v = initialFormData.vision_mission[q.id.toString()];
                    return v != null && v !== '';
                });
                if (!chunkComplete) {
                    setCurrentVisionChunk(c);
                    break;
                }
            }
        }
    }, [philosophy, initialFormData, managementPhilosophyQuestions, visionMissionQuestions, leadershipQuestions, generalQuestions, stepStorageKey]);

    useEffect(() => {
        try {
            window.sessionStorage.setItem(
                stepStorageKey,
                JSON.stringify({ step: currentStep, visionChunk: currentVisionChunk }),
            );
        } catch {
            // ignore storage errors
        }
    }, [stepStorageKey, currentStep, currentVisionChunk]);

    const [submitError, setSubmitError] = useState<string | null>(null);

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    const totalQuestions = managementPhilosophyQuestions.length + visionMissionQuestions.length + 1 + leadershipQuestions.length + generalQuestions.length + 1 + (concernsQuestion ? 1 : 0) + 1;
    const answeredCount = () => {
        let n = 0;
        n += Object.values(data.management_philosophy).filter((v) => v != null && !Number.isNaN(Number(v))).length;
        n += Object.values(data.vision_mission).filter((v) => v != null && (typeof v === 'string' ? v.trim() !== '' : true)).length;
        if (data.growth_stage?.trim()) n += 1;
        n += Object.values(data.leadership).filter((v) => v != null && !Number.isNaN(Number(v))).length;
        n += Object.values(data.general).filter((v) => v != null && !Number.isNaN(Number(v))).length;
        if (data.concerns?.trim()) n += 1;
        n += (data.organizational_issues?.length ?? 0) > 0 ? 1 : 0;
        return n;
    };

    const validateCurrentStep = (): { valid: boolean; message?: string; ref?: HTMLDivElement | null } => {
        const stepId = STEPS[currentStep].id;
        if (stepId === 'intro') return { valid: hasAgreed };
        if (stepId === 'management') {
            const qs = managementPhilosophyQuestions;
            for (const q of qs) {
                const v = data.management_philosophy[q.id.toString()];
                if (v === undefined || v === null || (typeof v === 'number' && isNaN(v))) {
                    return { valid: false, message: tx('validationAnswerQuestion'), ref: stepRefs.current[currentStep] };
                }
            }
        }
        if (stepId === 'vision') {
            const qs = visionMissionQuestions;
            for (const q of qs) {
                const v = data.vision_mission[q.id.toString()];
                if (v === undefined || v === null || v === '') {
                    return { valid: false, message: tx('validationAnswerQuestion'), ref: stepRefs.current[currentStep] };
                }
            }
        }
        if (stepId === 'growth') {
            if (!data.growth_stage?.trim()) {
                return { valid: false, message: tx('validationAnswerQuestion'), ref: stepRefs.current[currentStep] };
            }
        }
        if (stepId === 'leadership') {
            for (const q of leadershipQuestions) {
                const v = data.leadership[q.id.toString()];
                if (v === undefined || v === null || (typeof v === 'number' && isNaN(v))) {
                    return { valid: false, message: tx('validationAnswerQuestion'), ref: stepRefs.current[currentStep] };
                }
            }
        }
        if (stepId === 'general') {
            for (const q of generalQuestions) {
                const v = data.general[q.id.toString()];
                if (v === undefined || v === null || (typeof v === 'number' && isNaN(v))) {
                    return { valid: false, message: tx('validationAnswerQuestion'), ref: stepRefs.current[currentStep] };
                }
            }
        }
        if (stepId === 'issues') {
            const selected = (data.organizational_issues || []).length;
            if (selected < 1) {
                return { valid: false, message: tx('validationSelectIssue'), ref: stepRefs.current[currentStep] };
            }
        }
        if (stepId === 'concerns') {
            if (concernsQuestion && !data.concerns?.trim()) {
                return { valid: false, message: tx('validationAnswerQuestion'), ref: stepRefs.current[currentStep] };
            }
        }
        return { valid: true };
    };

    const validateVisionChunk = (chunkIndex: number): { valid: boolean; message?: string; ref?: HTMLDivElement | null } => {
        const qs = visionChunkQuestions(chunkIndex);
        for (const q of qs) {
            const v = data.vision_mission[q.id.toString()];
            const empty = v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.every((x) => !String(x).trim()));
            if (empty) return { valid: false, message: tx('validationAnswerPart'), ref: stepRefs.current[currentStep] };
        }
        return { valid: true };
    };

    // Clear step validation banner as soon as the current step / vision chunk becomes valid.
    useEffect(() => {
        if (!validationError) return;
        if (currentStep === 0) {
            if (hasAgreed) setValidationError(null);
            return;
        }
        if (currentStep === 2) {
            if (currentVisionChunk < 2) {
                if (validateVisionChunk(currentVisionChunk).valid) {
                    setValidationError(null);
                }
                return;
            }
        }
        if (validateCurrentStep().valid) {
            setValidationError(null);
        }
    }, [data, currentStep, currentVisionChunk, hasAgreed, validationError]);

    const handleNext = () => {
        if (currentStep === 0) {
            if (!hasAgreed) {
                return;
            }
            setHasSeenIntro(true);
        } else if (currentStep === 2) {
            if (currentVisionChunk < 2) {
                const result = validateVisionChunk(currentVisionChunk);
                if (!result.valid) {
                    setValidationError(result.message ?? null);
                    result.ref?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }
                setValidationError(null);
                setCurrentVisionChunk(currentVisionChunk + 1);
                return;
            }
            const result = validateCurrentStep();
            if (!result.valid) {
                setValidationError(result.message || tx('validationAnswerQuestion'));
                afterPaint(() => result.ref?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                return;
            }
            setValidationError(null);
            setCurrentVisionChunk(0);
        } else {
            const result = validateCurrentStep();
            if (!result.valid) {
                setValidationError(result.message || tx('validationAnswerQuestion'));
                afterPaint(() => {
                    result.ref?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
                return;
            }
            setValidationError(null);
        }
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep === 2 && currentVisionChunk > 0) {
            setCurrentVisionChunk(currentVisionChunk - 1);
            setValidationError(null);
            return;
        }
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setValidationError(null);
        }
    };

    const handleSubmit = () => {
        const result = validateCurrentStep();
        if (!result.valid) {
            setValidationError(result.message || tx('validationAnswerQuestion'));
            result.ref?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        setValidationError(null);
        setSubmitError(null);
        post(`/ceo/philosophy/survey/${project.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: tx('submitSuccessTitle'),
                    description: tx('submitSuccessDesc'),
                    variant: 'success',
                });
            },
            onError: () => {
                setSubmitError(tx('submitFailedInline'));
                toast({
                    title: tx('submitFailedTitle'),
                    description: tx('submitFailedDesc'),
                    variant: 'destructive',
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const showStepErrors = Boolean(validationError) || Object.keys(errors).length > 0;

    const renderStepContent = () => {
        const stepId = STEPS[currentStep].id;
        switch (stepId) {
            case 'intro':
                return (
                    <IntroStep
                        introText={introText}
                        hasAgreed={hasAgreed}
                        onAgreeChange={setHasAgreed}
                    />
                );
            case 'management':
                return (
                    <ManagementStep
                        stepMeta={STEPS[currentStep]}
                        stepIndex={currentStep}
                        totalSteps={STEPS.length}
                        questions={managementPhilosophyQuestions}
                        data={data}
                        setData={setData}
                        showErrors={showStepErrors}
                    />
                );
            case 'vision':
                return (
                    <VisionStep
                        currentChunk={currentVisionChunk}
                        onChunkChange={setCurrentVisionChunk}
                        getChunkQuestions={visionChunkQuestions}
                        data={data}
                        setData={setData}
                        showErrors={showStepErrors}
                    />
                );
            case 'growth':
                return (
                    <GrowthStep
                        stepMeta={STEPS[currentStep]}
                        stepIndex={currentStep}
                        totalSteps={STEPS.length}
                        question={growthStageQuestion}
                        value={data.growth_stage}
                        onChange={(value) => setData('growth_stage', value)}
                        showError={showStepErrors}
                    />
                );
            case 'leadership':
                return (
                    <LeadershipStep
                        questions={leadershipQuestions}
                        data={data}
                        setData={setData}
                        showErrors={showStepErrors}
                    />
                );
            case 'general':
                return (
                    <GeneralStep
                        questions={generalQuestions}
                        data={data}
                        setData={setData}
                        showErrors={showStepErrors}
                    />
                );
            case 'issues':
                return (
                    <IssuesStep
                        question={issuesQuestion}
                        hrIssues={hrIssues}
                        data={data}
                        setData={setData}
                        showError={showStepErrors}
                    />
                );
            case 'concerns':
                return (
                    <ConcernsStep
                        question={concernsQuestion}
                        value={data.concerns}
                        onChange={(value) => setData('concerns', value)}
                        showError={showStepErrors}
                    />
                );
            default:
                return null;
        }
    };

    const isStepComplete = (i: number) => {
        if (i === 0) return hasAgreed;
        if (i === 1) return managementPhilosophyQuestions.every((q) => data.management_philosophy[q.id.toString()] != null && !Number.isNaN(Number(data.management_philosophy[q.id.toString()])));
        if (i === 2) return visionMissionQuestions.every((q) => data.vision_mission[q.id.toString()] != null && data.vision_mission[q.id.toString()] !== '');
        if (i === 3) return !!data.growth_stage?.trim();
        if (i === 4) return leadershipQuestions.every((q) => data.leadership[q.id.toString()] != null);
        if (i === 5) return generalQuestions.every((q) => data.general[q.id.toString()] != null);
        if (i === 6) return (data.organizational_issues || []).length >= 1;
        if (i === 7) return !!data.concerns?.trim();
        return false;
    };

    const canJumpToStep = (targetStep: number) => {
        if (targetStep === currentStep) return true;
        return isStepComplete(targetStep) || targetStep < currentStep;
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Toaster />
            <Sidebar collapsible="icon" variant="sidebar">
                <CEOSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-[#F0EDE6] dark:bg-[#060d1f]">
                <AppHeader />
                <div className="sticky top-0 z-10 border-b border-[#E2DDD4] bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-3.5 lg:px-10 dark:border-slate-700/70 dark:bg-[#060d1f]/95">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-2.5">
                        <span className="text-[15px] font-semibold tracking-tight text-[#0E1628] dark:text-slate-100">
                            {currentStep === 6 ? tx('orgIssues') : currentStep === 7 ? tx('ceoConcerns') : tx('managementDiagnosis')}
                        </span>
                        {currentStep === 7 ? (
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#0E1628] to-[#2A3F6B] rounded-full py-1 px-3">
                                <span className="font-serif text-[15px] font-bold text-[#E8C96B]">100%</span>
                                <span className="text-[10px] text-white/50 uppercase tracking-wider">{tx('complete')}</span>
                            </div>
                        ) : currentStep === 6 ? (
                            <div className="flex items-center gap-2 bg-[#0E1628] rounded-full py-1.5 px-3.5">
                                <span className="font-serif text-base font-bold text-[#E8C96B] leading-none">
                                    {(data.organizational_issues || []).length}
                                </span>
                                <span className="text-xs text-white/30">/</span>
                                <span className="text-[13px] text-white/50">{MAX_ORGANIZATIONAL_ISSUES}</span>
                                <span className="text-[11px] text-white/40 font-light ml-0.5">{tx('selected')}</span>
                            </div>
                        ) : (
                            <span className="text-[11px] text-[#9A9EB8] dark:text-slate-400">
                                {tx('section')} <strong className="text-[#C9A84C] font-semibold">{currentStep + 1}</strong> / {STEPS.length}
                            </span>
                        )}
                    </div>
                    {currentStep === 6 && (
                        <div className="flex gap-1.5 mb-2">
                            {Array.from({ length: MAX_ORGANIZATIONAL_ISSUES }, (_, i) => {
                                const n = (data.organizational_issues || []).length;
                                const filled = i < n;
                                return (
                                    <div
                                        key={i}
                                        className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[8px] font-bold transition-all ${
                                            filled ? 'bg-[#0E1628] border-[#0E1628] text-[#E8C96B]' : 'bg-white border-[#E2DDD4] text-transparent'
                                        }`}
                                    >
                                        {filled ? i + 1 : ''}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="-mx-1 flex flex-wrap gap-1.5 overflow-x-auto pb-1">
                        {STEPS.map((s, i) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                    if (!canJumpToStep(i)) return;
                                    setCurrentStep(i);
                                    if (i !== 2) setCurrentVisionChunk(0);
                                }}
                                disabled={!canJumpToStep(i)}
                                className={`h-7 rounded-full border px-3 text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                                    i === currentStep
                                        ? 'bg-[#0E1628] border-[#0E1628] text-white shadow-sm shadow-[#0E1628]/30'
                                        : isStepComplete(i)
                                            ? 'bg-[#2E9E6B]/10 border-[#2E9E6B]/35 text-[#2E9E6B] dark:text-emerald-300'
                                            : 'bg-transparent border-[#E2DDD4] text-[#9A9EB8] dark:text-slate-400 dark:border-slate-600/80'
                                } ${canJumpToStep(i) ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                            >
                                <span className="text-[12px] leading-none">{s.icon}</span>
                                <span className={`${i === currentStep ? 'text-white' : ''}`}>
                                    {isKo ? s.nameKo : s.name}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-[#E8E4DC] dark:bg-slate-700/80">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0E1628] via-[#1f355e] to-[#C9A84C] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <main className="flex-1 overflow-auto">
                    <Head
                        title={t('page_heads.management_philosophy_survey', {
                            company:
                                project?.company?.name ||
                                t('page_head_fallbacks.company'),
                        })}
                    />
                    <div className="mx-auto w-full max-w-none px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-32 lg:px-10">
                        <InlineErrorSummary
                            className="mb-4"
                            message={validationError || submitError}
                            errors={errors}
                        />
                        <div
                            ref={(el) => {
                                stepRefs.current[currentStep] = el;
                            }}
                            className="rounded-2xl border border-[#E2DDD4] bg-white/95 p-4 shadow-sm sm:p-6 dark:border-slate-700/80 dark:bg-slate-900/70"
                        >
                            {renderStepContent()}
                        </div>
                    </div>
                </main>

                <div className="z-20 flex flex-col items-stretch justify-between gap-3 border-t border-[#E2DDD4] bg-white/95 px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:px-6 sm:py-4 lg:px-10 dark:border-slate-700/70 dark:bg-[#060d1f]/95">
                    <span className="text-[12px] text-[#9A9EB8] dark:text-slate-400 order-2 sm:order-1 text-center sm:text-left">
                        {currentStep === 6 ? (
                            <>
                                {tx('issuesProgress', { count: (data.organizational_issues || []).length, max: MAX_ORGANIZATIONAL_ISSUES })}
                            </>
                        ) : (
                            <>
                                {tx('answeredProgress', { answered: answeredCount(), total: totalQuestions })}
                            </>
                        )}
                    </span>
                    <div className="flex gap-2 sm:gap-2.5 justify-center sm:justify-end order-1 sm:order-2">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="min-w-0 flex-1 border-[#E2DDD4] text-[#4A4E69] hover:border-[#0E1628] hover:text-[#0E1628] sm:min-w-[110px] sm:flex-none dark:border-slate-600/90 dark:text-slate-300 dark:hover:border-slate-400 dark:hover:text-slate-100"
                        >
                            ← {tx('previous')}
                        </Button>
                        {currentStep < STEPS.length - 1 ? (
                            <Button
                                onClick={handleNext}
                                disabled={currentStep === 0 && !hasAgreed}
                                className="min-w-0 flex-1 bg-gradient-to-r from-[#0E1628] to-[#1A2D50] text-white hover:from-[#122247] hover:to-[#223c67] sm:min-w-[150px] sm:flex-none"
                            >
                                {currentStep === 2 && currentVisionChunk < 2 ? `${tx('nextPart')} →` : `${tx('nextSection')} →`}
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={processing} className="min-w-0 flex-1 bg-gradient-to-r from-[#0E1628] to-[#1A2D50] text-white hover:from-[#122247] hover:to-[#223c67] sm:min-w-[170px] sm:flex-none">
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        {tx('submitting')}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        {tx('submit')} ✓
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
