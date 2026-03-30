import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import InlineErrorSummary from '@/components/Forms/InlineErrorSummary';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { STEPS, MAX_ORGANIZATIONAL_ISSUES } from './constants';
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
    hrIssues,
    introText,
    diagnosis,
    locked = false,
    surveyOldInput,
}: Props) {
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
        setCurrentStep(firstIncomplete);

        if (firstIncomplete === 2) {
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
    }, [philosophy, initialFormData, managementPhilosophyQuestions, visionMissionQuestions, leadershipQuestions, generalQuestions]);

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
                    return { valid: false, message: 'Please answer this question before continuing.', ref: stepRefs.current[currentStep] };
                }
            }
        }
        if (stepId === 'vision') {
            const qs = visionMissionQuestions;
            for (const q of qs) {
                const v = data.vision_mission[q.id.toString()];
                if (v === undefined || v === null || v === '') {
                    return { valid: false, message: 'Please answer this question before continuing.', ref: stepRefs.current[currentStep] };
                }
            }
        }
        if (stepId === 'growth') {
            if (!data.growth_stage?.trim()) {
                return { valid: false, message: 'Please answer this question before continuing.', ref: stepRefs.current[currentStep] };
            }
        }
        if (stepId === 'leadership') {
            for (const q of leadershipQuestions) {
                const v = data.leadership[q.id.toString()];
                if (v === undefined || v === null || (typeof v === 'number' && isNaN(v))) {
                    return { valid: false, message: 'Please answer this question before continuing.', ref: stepRefs.current[currentStep] };
                }
            }
        }
        if (stepId === 'general') {
            for (const q of generalQuestions) {
                const v = data.general[q.id.toString()];
                if (v === undefined || v === null || (typeof v === 'number' && isNaN(v))) {
                    return { valid: false, message: 'Please answer this question before continuing.', ref: stepRefs.current[currentStep] };
                }
            }
        }
        if (stepId === 'issues') {
            const selected = (data.organizational_issues || []).length;
            if (selected < 1) {
                return { valid: false, message: 'Please select at least 1 organizational issue before continuing.', ref: stepRefs.current[currentStep] };
            }
        }
        if (stepId === 'concerns') {
            if (concernsQuestion && !data.concerns?.trim()) {
                return { valid: false, message: 'Please answer this question before continuing.', ref: stepRefs.current[currentStep] };
            }
        }
        return { valid: true };
    };

    const validateVisionChunk = (chunkIndex: number): { valid: boolean; message?: string; ref?: HTMLDivElement | null } => {
        const qs = visionChunkQuestions(chunkIndex);
        for (const q of qs) {
            const v = data.vision_mission[q.id.toString()];
            const empty = v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.every((x) => !String(x).trim()));
            if (empty) return { valid: false, message: 'Please answer all questions in this part before continuing.', ref: stepRefs.current[currentStep] };
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
                setValidationError(result.message || 'Please answer this question before continuing.');
                setTimeout(() => result.ref?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                return;
            }
            setValidationError(null);
            setCurrentVisionChunk(0);
        } else {
            const result = validateCurrentStep();
            if (!result.valid) {
                setValidationError(result.message || 'Please answer this question before continuing.');
                setTimeout(() => {
                    result.ref?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
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
            setValidationError(result.message || 'Please answer this question before continuing.');
            result.ref?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        setValidationError(null);
        setSubmitError(null);
        post(`/ceo/philosophy/survey/${project.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Survey submitted successfully',
                    description: 'Your CEO philosophy survey has been saved.',
                    variant: 'success',
                });
            },
            onError: () => {
                setSubmitError('Could not submit. Please check all answers and try again.');
                toast({
                    title: 'Submission failed',
                    description: 'Please check all required answers and try again.',
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

    return (
        <SidebarProvider defaultOpen={true}>
            <Toaster />
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-[#F0EDE6] dark:bg-slate-900">
                <AppHeader />
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-[#E2DDD4] dark:border-slate-700 px-4 sm:px-6 lg:px-10 py-3 sm:py-3.5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-2.5">
                        <span className="font-serif text-[15px] font-semibold text-[#0E1628] dark:text-slate-100">
                            {currentStep === 6 ? 'Organizational Issues' : currentStep === 7 ? "CEO's Concerns" : '경영 철학 진단'}
                        </span>
                        {currentStep === 7 ? (
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#0E1628] to-[#2A3F6B] rounded-full py-1 px-3">
                                <span className="font-serif text-[15px] font-bold text-[#E8C96B]">100%</span>
                                <span className="text-[10px] text-white/50 uppercase tracking-wider">Complete</span>
                            </div>
                        ) : currentStep === 6 ? (
                            <div className="flex items-center gap-2 bg-[#0E1628] rounded-full py-1.5 px-3.5">
                                <span className="font-serif text-base font-bold text-[#E8C96B] leading-none">
                                    {(data.organizational_issues || []).length}
                                </span>
                                <span className="text-xs text-white/30">/</span>
                                <span className="text-[13px] text-white/50">{MAX_ORGANIZATIONAL_ISSUES}</span>
                                <span className="text-[11px] text-white/40 font-light ml-0.5">selected</span>
                            </div>
                        ) : (
                            <span className="text-[11px] text-[#9A9EB8] dark:text-slate-400">
                                섹션 <strong className="text-[#C9A84C] font-semibold">{currentStep + 1}</strong> / {STEPS.length}
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
                    <div className="flex gap-1.5 flex-wrap overflow-x-auto pb-1 -mx-1">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.id}
                                className={`h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1.5 border transition-all ${
                                    i === currentStep
                                        ? 'bg-[#0E1628] border-[#0E1628] text-white'
                                        : isStepComplete(i)
                                            ? 'bg-[#2E9E6B]/10 border-[#2E9E6B]/30 text-[#2E9E6B] dark:text-green-400'
                                            : 'bg-transparent border-[#E2DDD4] text-[#9A9EB8] dark:text-slate-400 dark:border-slate-600'
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${i === currentStep ? 'bg-[#E8C96B]' : 'bg-current opacity-60'}`} />
                                {s.nameKo || s.name}
                            </div>
                        ))}
                    </div>
                    <div className="mt-2.5 h-[3px] bg-[#E8E4DC] dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0E1628] to-[#C9A84C] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <main className="flex-1 overflow-auto">
                    <Head title={`Management Philosophy Survey - ${project?.company?.name || 'Company'}`} />
                    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 pb-28 sm:pb-32">
                        <InlineErrorSummary
                            className="mb-4"
                            message={validationError || submitError}
                            errors={errors}
                        />
                        <div ref={(el) => { stepRefs.current[currentStep] = el; }}>
                            {renderStepContent()}
                        </div>
                    </div>
                </main>

                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-[#E2DDD4] dark:border-slate-700 py-3 sm:py-4 px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-20">
                    <span className="text-[12px] text-[#9A9EB8] dark:text-slate-400 order-2 sm:order-1 text-center sm:text-left">
                        {currentStep === 6 ? (
                            <>
                                <strong className="text-[#0E1628] dark:text-slate-100 font-semibold">{(data.organizational_issues || []).length}</strong> / {MAX_ORGANIZATIONAL_ISSUES} issues selected
                            </>
                        ) : (
                            <>
                                <strong className="text-[#0E1628] dark:text-slate-100 font-semibold">{answeredCount()}</strong> / {totalQuestions} 문항 응답
                            </>
                        )}
                    </span>
                    <div className="flex gap-2 sm:gap-2.5 justify-center sm:justify-end order-1 sm:order-2">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="flex-1 sm:flex-none min-w-0 sm:min-w-[100px] border-[#E2DDD4] dark:border-slate-600 text-[#4A4E69] dark:text-slate-300 hover:border-[#0E1628] dark:hover:border-slate-400 hover:text-[#0E1628] dark:hover:text-slate-100"
                        >
                            ← 이전
                        </Button>
                        {currentStep < STEPS.length - 1 ? (
                            <Button
                                onClick={handleNext}
                                disabled={currentStep === 0 && !hasAgreed}
                                className="flex-1 sm:flex-none min-w-0 sm:min-w-[140px] bg-[#0E1628] hover:bg-[#1A2D50] text-white"
                            >
                                {currentStep === 2 && currentVisionChunk < 2 ? 'Next part →' : '다음 섹션 →'}
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={processing} className="flex-1 sm:flex-none min-w-0 sm:min-w-[160px] bg-[#0E1628] hover:bg-[#1A2D50] text-white">
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        제출 중...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        제출하기 ✓
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
