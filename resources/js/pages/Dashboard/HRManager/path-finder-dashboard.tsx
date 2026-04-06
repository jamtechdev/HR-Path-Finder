import AppLayout from '@/layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Building2,
    CheckCircle2,
    ClipboardList,
    Lock,
    Target,
    Unlock,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const getStepConfig = (t) => [
    {
        id: 'diagnosis',
        num: 1,
        title: t('steps.diagnosis.title'),
        desc: t('steps.diagnosis.desc'),
    },
    {
        id: 'job_analysis',
        num: 2,
        title: t('steps.job_analysis.title'),
        desc: t('steps.job_analysis.desc'),
    },
    {
        id: 'performance',
        num: 3,
        title: t('steps.performance.title'),
        desc: t('steps.performance.desc'),
    },
    {
        id: 'compensation',
        num: 4,
        title: t('steps.compensation.title'),
        desc: t('steps.compensation.desc'),
    },
];

interface StageProgressPercentMap {
    diagnosis: number;
    job_analysis: number;
    performance: number;
    compensation: number;
    hr_policy_os: number;
}

interface PathFinderDashboardProps {
    workspaceDone?: boolean;
    user?: { name: string; email: string };
    activeProject?: {
        id: number;
        company: { id: number; name: string };
        status: string;
        step_statuses?: Record<string, string>;
    } | null;
    company?: { id: number; name: string; hasCeo: boolean } | null;
    progress?: {
        completed: number;
        total: number;
        currentStepNumber: number;
        currentStepKey: string | null;
    };
    stepStatuses?: Record<string, string>;
    projectId?: number | null;
    ceoPhilosophyStatus?: string;
    /** Real per-stage % (ProjectStageProgressService) — fixes showing overall 1/5 as step progress */
    stageProgressPercent?: StageProgressPercentMap;
}

type StepUiState = 'completed' | 'current' | 'locked' | 'available';

function getStepState(
    stepId: string,
    stepIndex: number,
    stepStatuses: Record<string, string>,
    currentStepKey: string | null,
    ceoPhilosophyStatus?: string,
    projectId?: number | null,
    stepConfig?: any[],
): StepUiState {
    const status = stepStatuses[stepId];
    const isStepComplete =
        status &&
        ['submitted', 'approved', 'locked', 'completed'].includes(status);

    // Final Dashboard: always reachable when project exists (sidebar + cards)
    if (stepId === 'hr_policy_os' && projectId) {
        if (isStepComplete) {
            return 'completed';
        }
        return 'available';
    }

    if (isStepComplete) return 'completed';

    if (stepIndex === 0) {
        return currentStepKey === stepId ? 'current' : 'locked';
    }
    const isCeoDone = ceoPhilosophyStatus === 'completed';
    if (!isCeoDone) return 'locked';
    for (let i = 0; i < stepIndex; i++) {
        const prev = stepConfig?.[i];
        const prevStatus = stepStatuses[prev.id];
        if (
            !prevStatus ||
            !['submitted', 'approved', 'locked', 'completed'].includes(
                prevStatus,
            )
        )
            return 'locked';
    }
    return currentStepKey === stepId ? 'current' : 'locked';
}

function stagePctFor(
    stepId: string,
    stageProgressPercent?: StageProgressPercentMap,
): number {
    if (!stageProgressPercent) return 0;
    const v = stageProgressPercent[stepId as keyof StageProgressPercentMap];
    return typeof v === 'number'
        ? Math.min(100, Math.max(0, Math.round(v)))
        : 0;
}

function getStepRoute(stepId: string, projectId?: number | null): string {
    if (!projectId)
        return stepId === 'diagnosis' ? '/hr-manager/diagnosis' : '#';
    const base: Record<string, string> = {
        diagnosis: '/hr-manager/diagnosis',
        job_analysis: '/hr-manager/job-analysis',
        performance: '/hr-manager/performance-system',
        compensation: '/hr-manager/compensation-system',
        hr_policy_os: '/hr-manager/tree',
    };
    const path = base[stepId];
    if (!path) return '#';
    if (stepId === 'hr_policy_os') return `${path}/${projectId}`;
    return `${path}/${projectId}/overview`;
}

export default function PathFinderDashboard({
    workspaceDone = true,
    user = { name: 'HR Manager', email: 'hrm@company.com' },
    activeProject = null,
    company = null,
    progress = {
        completed: 0,
        total: 4,
        currentStepNumber: 1,
        currentStepKey: 'diagnosis',
    },
    stepStatuses = {},
    projectId = null,
    ceoPhilosophyStatus = 'not_started',
    stageProgressPercent,
}: PathFinderDashboardProps) {
    const { t } = useTranslation();

    const STEP_CONFIG = useMemo(() => getStepConfig(t), [t]);
    const currentStepKey = progress.currentStepKey ?? 'diagnosis';
    const currentStepTitle =
        STEP_CONFIG.find((s) => s.id === currentStepKey)?.title ?? 'Diagnosis';
    const companyName = company?.name ?? activeProject?.company?.name ?? null;
    const isCurrentStepSubmitted =
        (stepStatuses[currentStepKey] ?? 'not_started') === 'submitted';

    const phaseStatusText = useMemo(() => {
        const status = stepStatuses[currentStepKey] ?? 'not_started';
        const title =
            STEP_CONFIG.find((s) => s.id === currentStepKey)?.title ??
            'Current step';
        if (status === 'submitted') {
            return {
                title: t('dashboard.pathfinder.submitted_title', { title }),
                hint: t('dashboard.pathfinder.submitted_hint'),
            };
        }
        if (status === 'in_progress') {
            return {
                title: t('dashboard.pathfinder.step_in_progress_title', { title }),
                hint: t('dashboard.pathfinder.step_in_progress_hint'),
            };
        }
        return null;
    }, [currentStepKey, stepStatuses]);

    const stepCards = STEP_CONFIG.map((s, i) => {
        const state = getStepState(
            s.id,
            i,
            stepStatuses,
            currentStepKey,
            ceoPhilosophyStatus,
            projectId,
            STEP_CONFIG,
        );
        const sp = stagePctFor(s.id, stageProgressPercent);
        let stepProgress = 0;
        if (state === 'completed') {
            stepProgress = 100;
        } else if (state === 'available') {
            stepProgress = sp;
        } else if (state === 'current' && s.id === currentStepKey) {
            stepProgress = sp;
        }
        return {
            ...s,
            step: s.num,
            status: state,
            progress: stepProgress,
            stepStatus: stepStatuses[s.id],
        };
    });

    // First-time / no workspace: show onboarding screen (create company to get started)
    if (!workspaceDone) {
        const onboardingProgress = 0;
        return (
            <AppLayout
                stepStatuses={{}}
                projectId={undefined}
                ceoPhilosophyStatus="not_started"
            >
                <Head title="HR Path-Finder — Dashboard" />
                <div className="min-h-full bg-slate-50 font-sans text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                    <div className="px-4 py-[30px] md:px-9">
                        <div className="mb-6">
                            <h1 className="text-[22px] leading-tight font-bold tracking-[-0.4px] text-slate-800 dark:text-slate-100">
                                {t('dashboard.pathfinder.welcome_back', {
                                    name: user.name,
                                })}
                            </h1>
                            <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
                                {t('dashboard.pathfinder.subtitle', {
                                    step: 1,
                                    title: t('steps.diagnosis'),
                                })}
                            </p>
                        </div>
                        {/* Blue banner - Step 1 in progress */}
                        <div className="relative mb-6 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[14px] bg-gradient-to-br from-[var(--hr-navy)] to-[var(--hr-navy-mid)] p-7 sm:flex-row sm:items-center md:px-8">
                            <div className="relative z-[1]">
                                <h2 className="mb-1.5 text-base font-bold text-white">
                                    Step 1: Diagnosis{' '}
                                    {t('dashboard.pathfinder.in_progress')}
                                </h2>
                                <p className="max-w-[380px] text-[12.5px] leading-relaxed text-white/55">
                                    {t('dashboard.pathfinder.banner_desc')}
                                </p>
                            </div>
                            <div className="relative z-[1] flex items-center gap-6">
                                <div className="relative h-16 w-16 flex-shrink-0">
                                    <svg
                                        className="h-16 w-16 -rotate-90"
                                        viewBox="0 0 64 64"
                                    >
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="26"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.1)"
                                            strokeWidth="5"
                                        />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="26"
                                            fill="none"
                                            stroke="#4ecdc4"
                                            strokeWidth="5"
                                            strokeDasharray="163.4"
                                            strokeDashoffset={
                                                163.4 -
                                                (163.4 * onboardingProgress) /
                                                    100
                                            }
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <strong className="text-[15px] leading-none font-bold text-white">
                                            {onboardingProgress}%
                                        </strong>
                                        <span className="mt-0.5 text-[9px] text-white/40">
                                            {t(
                                                'dashboard.pathfinder.complete',
                                                '완료',
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href="/hr-manager/companies"
                                    className="flex items-center gap-1.5 rounded-lg bg-[var(--hr-mint)] px-5 py-2.5 text-[13px] font-bold whitespace-nowrap text-[var(--hr-navy-deep)] transition-all hover:-translate-y-0.5 hover:bg-[#5de0d7]"
                                >
                                    {t('dashboard.pathfinder.continue')} →
                                </Link>
                            </div>
                        </div>
                        {/* Design Steps - Step 1 active, rest locked */}
                        <div className="mb-3.5 flex items-baseline justify-between">
                            <h3 className="text-[15px] font-bold tracking-[-0.2px] text-slate-800 dark:text-slate-100">
                                {t('dashboard.pathfinder.design_steps')}
                            </h3>
                            <span className="text-[11.5px] text-slate-400 dark:text-slate-500">
                                {t('dashboard.pathfinder.completed_count', {
                                    done: 0,
                                    total: 4,
                                })}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                            {/* Step 1 - Active */}
                            <div className="relative overflow-hidden rounded-xl border border-[#4ecdc4] bg-white p-5 pl-[22px] shadow-[0_0_0_1px_#4ecdc4,0_4px_20px_rgba(78,205,196,0.12)] transition-all dark:bg-slate-900">
                                <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-[#4ecdc4] to-[#3ab5ad]" />
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                            Step 1
                                        </span>
                                        <span className="rounded-[20px] bg-[var(--hr-mint-dim)] px-2 py-0.5 text-[10px] font-semibold text-[#2ea89e]">
                                            ●{' '}
                                            {t(
                                                'dashboard.pathfinder.in_progress',
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(78,205,196,0.12)] text-base">
                                    <Building2 className="h-5 w-5 text-[#4ecdc4]" />
                                </div>
                                <h4 className="mb-1.5 text-sm font-bold tracking-[-0.2px] text-slate-800 dark:text-slate-100">
                                    {t('steps.diagnosis.title')}
                                </h4>
                                <p className="mb-4 text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                                    {STEP_CONFIG[0].desc}
                                </p>
                                <div className="mb-4">
                                    <div className="mb-1 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                                        <span>
                                            {t(
                                                'dashboard.pathfinder.progress_label',
                                            )}
                                        </span>
                                        <span>{onboardingProgress}%</span>
                                    </div>
                                    <div className="h-1 overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
                                        <div
                                            className="h-full rounded bg-gradient-to-r from-[#4ecdc4] to-[#3ab5ad] transition-[width] duration-500"
                                            style={{
                                                width: `${onboardingProgress}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span />
                                    <Link
                                        href="/hr-manager/companies"
                                        className="flex items-center gap-1.5 rounded-[7px] bg-[var(--hr-navy)] px-4 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--hr-navy-mid)]"
                                    >
                                        {t(
                                            'dashboard.pathfinder.start_btn',
                                            '시작하기',
                                        )}{' '}
                                        →
                                    </Link>
                                </div>
                            </div>
                            {/* Steps 2–4 locked */}
                            {STEP_CONFIG.slice(1, 4).map((step) => (
                                <div
                                    key={step.id}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-5 opacity-70 dark:border-slate-700 dark:bg-slate-800"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                Step {step.num}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                <Lock className="h-3 w-3" />
                                                {t(
                                                    'dashboard.pathfinder.locked',
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-slate-100 text-[13px] dark:bg-slate-800">
                                            <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                        </div>
                                    </div>
                                    <h4 className="mb-1.5 text-sm font-bold text-slate-400 dark:text-slate-500">
                                        {step.title}
                                    </h4>
                                    <p className="mb-4 text-[11.5px] leading-relaxed text-slate-400 dark:text-slate-500">
                                        {step.desc}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                        {t(
                                            'dashboard.pathfinder.prev_step_required_after',
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            stepStatuses={stepStatuses}
            projectId={projectId ?? undefined}
            ceoPhilosophyStatus={ceoPhilosophyStatus}
        >
            <Head title="HR Path-Finder — Dashboard" />
            <div className="min-h-full bg-slate-50 font-sans text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                <div className="px-4 py-[30px] md:px-9">
                    {/* PAGE HEADER + COMPANY TAG */}
                    <div className="mb-6">
                        {companyName && (
                            <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-[20px] border border-[rgba(78,205,196,0.25)] bg-[var(--hr-mint-dim)] py-[3px] pr-2.5 pl-[6px]">
                                <div className="h-1.5 w-1.5 rounded-full bg-[var(--hr-mint)]" />
                                <span className="text-[11.5px] font-semibold text-[#2ea89e]">
                                    {companyName}
                                </span>
                            </div>
                        )}
                        <h1 className="text-[22px] leading-tight font-bold tracking-[-0.4px] text-slate-800 dark:text-slate-100">
                            {t('dashboard.pathfinder.welcome_back', {
                                name: user.name,
                            })}
                        </h1>
                        <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
                            {t('dashboard.pathfinder.subtitle', {
                                step: progress.currentStepNumber,
                                title: t(`steps.${currentStepKey}.title`),
                            })}
                        </p>
                    </div>

                    {/* Submitted - waiting for CEO banner */}
                    {phaseStatusText && (
                        <div className="mb-6 flex items-center gap-4 rounded-xl border border-[var(--hr-mint)] bg-[rgba(78,205,196,0.08)] px-5 py-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--hr-mint)] text-[var(--hr-navy-deep)]">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-[var(--hr-gray-800)]">
                                    {phaseStatusText.title}
                                </p>
                                <p className="mt-0.5 text-[12px] text-[var(--hr-gray-500)]">
                                    {phaseStatusText.hint}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STAT CARDS */}
                    <div className="grid=cols-1 mb-6 grid gap-3 md:grid-cols-4">
                        <div className="relative overflow-hidden rounded-xl border-0 bg-gradient-to-br from-[var(--hr-navy)] to-[var(--hr-navy-mid)] p-[18px] pr-5 transition-shadow hover:shadow-md">
                            <div className="pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full bg-[rgba(78,205,196,0.1)]" />
                            <div className="mb-2.5 flex items-center justify-between">
                                <span className="text-[10.5px] font-semibold tracking-[0.6px] text-white/45 uppercase">
                                    {t('dashboard.pathfinder.overall_progress')}
                                </span>
                                <span className="rounded-[20px] bg-[rgba(78,205,196,0.15)] px-1.5 py-0.5 text-[9.5px] font-semibold text-[var(--hr-mint)]">
                                    {isCurrentStepSubmitted
                                        ? t(
                                              'dashboard.pathfinder.submitted_short',
                                              'Submitted',
                                          )
                                        : t('dashboard.pathfinder.in_progress')}
                                </span>
                            </div>
                            <div className="text-[26px] leading-none font-bold tracking-[-1px] text-white">
                                {progress.completed}{' '}
                                <sup className="text-[14px] font-medium text-white/40">
                                    / {progress.total}
                                </sup>
                            </div>
                            <div className="mt-1 text-[11px] text-white/40">
                                {t('dashboard.pathfinder.completed_steps')}
                            </div>
                            <div className="absolute right-4 bottom-3.5 opacity-15">
                                <BarChart3 className="h-[22px] w-[22px] text-white" />
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-[18px] pr-5 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-2.5 text-[10.5px] font-semibold tracking-[0.6px] text-slate-400 uppercase dark:text-slate-500">
                                {t('dashboard.pathfinder.ceo_survey')}
                            </div>
                            <div
                                className={`mt-1 text-[19px] font-bold ${ceoPhilosophyStatus === 'completed' ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}
                            >
                                {ceoPhilosophyStatus === 'completed'
                                    ? t('dashboard.pathfinder.complete')
                                    : ceoPhilosophyStatus === 'in_progress'
                                      ? t('dashboard.pathfinder.in_progress')
                                      : t('dashboard.pathfinder.not_started')}
                            </div>
                            <div className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                                {ceoPhilosophyStatus === 'completed'
                                    ? ''
                                    : t(
                                          'dashboard.pathfinder.ceo_survey_start_hint',
                                      )}
                            </div>
                            <div className="absolute right-4 bottom-3.5 opacity-[0.08]">
                                <ClipboardList className="h-[22px] w-[22px] text-slate-800 dark:text-slate-100" />
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-[18px] pr-5 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-2.5 flex items-center justify-between">
                                <span className="text-[10.5px] font-semibold tracking-[0.6px] text-slate-400 uppercase dark:text-slate-500">
                                    {t('dashboard.pathfinder.current_step')}
                                </span>
                                <span className="rounded-[20px] bg-[rgba(78,205,196,0.12)] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#2ea89e]">
                                    {t('dashboard.pathfinder.active')}
                                </span>
                            </div>
                            <div className="mt-1 text-[22px] font-bold text-slate-800 dark:text-slate-100">
                                Step {progress.currentStepNumber}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                {currentStepTitle}
                            </div>
                            <div className="absolute right-4 bottom-3.5 opacity-[0.08]">
                                <Target className="h-[22px] w-[22px] text-slate-800 dark:text-slate-100" />
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-[18px] pr-5 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-2.5 text-[10.5px] font-semibold tracking-[0.6px] text-slate-400 uppercase dark:text-slate-500">
                                {t('dashboard.pathfinder.steps_remaining')}
                            </div>
                            <div className="text-[26px] leading-none font-bold tracking-[-1px] text-slate-800 dark:text-slate-100">
                                {progress.total - progress.completed}
                            </div>
                            <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                                {t('dashboard.pathfinder.keep_going')}
                            </div>
                            <div className="absolute right-4 bottom-3.5 opacity-[0.08]">
                                <Unlock className="h-[22px] w-[22px] text-slate-800 dark:text-slate-100" />
                            </div>
                        </div>
                    </div>

                    {/* STEP PROGRESS STRIP */}
                    <div className="mb-6 flex items-center rounded-xl border border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
                        {STEP_CONFIG.map((step, index) => {
                            const isActive = step.id === currentStepKey;
                            const isDone = progress.completed > index;
                            const isLocked =
                                !(step.id === 'hr_policy_os' && projectId) &&
                                !isActive &&
                                !isDone;
                            const hasLine = index < STEP_CONFIG.length - 1;
                            const lineDone = isDone;
                            const lineActive = isActive && !isDone;
                            return (
                                <div
                                    key={step.id}
                                    className="relative flex flex-1 flex-col items-center gap-2"
                                >
                                    {hasLine && (
                                        <div
                                            className="pointer-events-none absolute top-[14px] left-[calc(50%+14px)] h-0.5 w-[calc(100%-28px)]"
                                            style={{
                                                background: lineDone
                                                    ? 'var(--hr-mint)'
                                                    : lineActive
                                                      ? 'linear-gradient(90deg, var(--hr-mint) 30%, var(--hr-gray-200) 100%)'
                                                      : 'var(--hr-gray-200)',
                                            }}
                                        />
                                    )}
                                    <div
                                        className={`relative z-[1] flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                                            isLocked
                                                ? 'border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'
                                                : isActive
                                                  ? 'border-[var(--hr-mint)] bg-[var(--hr-mint)] text-[var(--hr-navy-deep)] shadow-[0_0_0_4px_rgba(78,205,196,0.15)]'
                                                  : 'border-[var(--hr-mint)] bg-[var(--hr-mint)] text-[var(--hr-navy-deep)]'
                                        }`}
                                    >
                                        {isLocked ? (
                                            <Lock className="h-3 w-3" />
                                        ) : (
                                            step.num
                                        )}
                                    </div>
                                    <span
                                        className={`relative z-[1] text-center text-[10.5px] font-medium ${isActive ? 'font-bold text-[var(--hr-navy)]' : 'text-slate-400 dark:text-slate-500'}`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* DESIGN STEPS */}
                    <div className="mb-3.5 flex items-baseline justify-between">
                        <h3 className="text-[15px] font-bold tracking-[-0.2px] text-slate-800 dark:text-slate-100">
                            {t('dashboard.pathfinder.design_steps')}
                        </h3>
                        <span className="text-[11.5px] text-slate-400 dark:text-slate-500">
                            {t('dashboard.pathfinder.completed_count', {
                                done: progress.completed,
                                total: progress.total,
                            })}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                        {stepCards.map((card) =>
                            card.fullWidth ? (
                                card.status === 'completed' ? (
                                    <div
                                        key={card.step}
                                        className="col-span-1 flex flex-col items-center justify-between rounded-xl border border-[var(--hr-mint)] bg-white px-[22px] py-[18px] md:col-span-2 md:flex-row dark:bg-slate-900"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[rgba(78,205,196,0.15)] text-base">
                                                <CheckCircle2 className="h-4 w-4 text-[#2ea89e]" />
                                            </div>
                                            <div>
                                                <div className="mb-1.5 flex gap-1.5">
                                                    <span className="rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                        Step {card.step}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-[20px] bg-[var(--hr-mint-dim)] px-2 py-0.5 text-[10px] font-semibold text-[#2ea89e]">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        {t(
                                                            'dashboard.pathfinder.complete',
                                                        )}
                                                    </span>
                                                </div>
                                                <h4 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                                                    {card.title}
                                                </h4>
                                                <p className="mb-0 text-[11.5px] text-slate-600 dark:text-slate-300">
                                                    {card.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={getStepRoute(
                                                card.id,
                                                projectId,
                                            )}
                                            className="text-[12px] font-semibold text-[var(--hr-navy)] hover:text-[var(--hr-navy-mid)]"
                                        >
                                            {t('buttons.view', 'View')} →
                                        </Link>
                                    </div>
                                ) : card.status === 'current' ? (
                                    <div
                                        key={card.step}
                                        className="col-span-1 flex flex-col items-center justify-between rounded-xl border border-[#4ecdc4] bg-white px-[22px] py-[18px] shadow-[0_0_0_1px_#4ecdc4,0_4px_20px_rgba(78,205,196,0.12)] md:col-span-2 md:flex-row dark:bg-slate-900"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[rgba(78,205,196,0.12)] text-base">
                                                <Building2 className="h-4 w-4 text-[#4ecdc4]" />
                                            </div>
                                            <div>
                                                <div className="mb-1.5 flex gap-1.5">
                                                    <span className="rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                        Step {card.step}
                                                    </span>
                                                    <span className="rounded-[20px] bg-[var(--hr-mint-dim)] px-2 py-0.5 text-[10px] font-semibold text-[#2ea89e]">
                                                        ●{' '}
                                                        {t(
                                                            'dashboard.pathfinder.in_progress',
                                                        )}
                                                    </span>
                                                </div>
                                                <h4 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                                                    {card.title}
                                                </h4>
                                                <p className="mb-0 text-[11.5px] text-slate-600 dark:text-slate-300">
                                                    {card.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={getStepRoute(
                                                card.id,
                                                projectId,
                                            )}
                                            className="rounded-[7px] bg-[var(--hr-navy)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--hr-navy-mid)]"
                                        >
                                            {t('dashboard.pathfinder.continue')}{' '}
                                            →
                                        </Link>
                                    </div>
                                ) : card.status === 'available' ? (
                                    <div
                                        key={card.step}
                                        className="col-span-1 flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-[22px] py-[18px] md:col-span-2 md:flex-row md:items-center dark:border-slate-600 dark:bg-slate-900"
                                    >
                                        <div className="flex min-w-0 items-start gap-4">
                                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-[rgba(78,205,196,0.12)] text-base">
                                                <BarChart3 className="h-4 w-4 text-[#4ecdc4]" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="mb-1.5 flex flex-wrap gap-1.5">
                                                    <span className="rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                        Step {card.step}
                                                    </span>
                                                    <span className="rounded-[20px] bg-[var(--hr-mint-dim)] px-2 py-0.5 text-[10px] font-semibold text-[#2ea89e]">
                                                        {t(
                                                            'dashboard.pathfinder.always_open',
                                                            'Always open',
                                                        )}
                                                    </span>
                                                </div>
                                                <h4 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                                                    {card.title}
                                                </h4>
                                                <p className="mb-3 text-[11.5px] text-slate-600 dark:text-slate-300">
                                                    {card.desc}
                                                </p>
                                                <div className="mb-1 max-w-md">
                                                    <div className="mb-1 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                                                        <span>
                                                            {t(
                                                                'dashboard.pathfinder.progress_label',
                                                            )}
                                                        </span>
                                                        <span>
                                                            {card.progress}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1 overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
                                                        <div
                                                            className="h-full rounded bg-gradient-to-r from-[#4ecdc4] to-[#3ab5ad] transition-[width] duration-500 ease-out"
                                                            style={{
                                                                width: `${card.progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={getStepRoute(
                                                card.id,
                                                projectId,
                                            )}
                                            className="flex-shrink-0 rounded-[7px] bg-[var(--hr-navy)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--hr-navy-mid)]"
                                        >
                                            {t('buttons.view', 'View')} →
                                        </Link>
                                    </div>
                                ) : (
                                    <div
                                        key={card.step}
                                        className="col-span-1 flex flex-col items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-[22px] py-[18px] opacity-70 md:col-span-2 md:flex-row dark:border-slate-700 dark:bg-slate-800"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-slate-200 text-base dark:bg-slate-700">
                                                <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <div>
                                                <div className="mb-1.5 flex gap-1.5">
                                                    <span className="rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                        Step {card.step}
                                                    </span>
                                                    <span className="rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                        {t(
                                                            'dashboard.pathfinder.locked',
                                                        )}
                                                    </span>
                                                </div>
                                                <h4 className="mb-1 text-sm font-bold text-slate-400 dark:text-slate-500">
                                                    {card.title}
                                                </h4>
                                                <p className="mb-0 text-[11.5px] text-slate-400 dark:text-slate-500">
                                                    {card.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-shrink-0 items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                                            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                            {t(
                                                'dashboard.pathfinder.prev_step_required_after',
                                            )}
                                        </div>
                                    </div>
                                )
                            ) : card.status === 'completed' ? (
                                <div
                                    key={card.step}
                                    className="relative overflow-hidden rounded-xl border border-[var(--hr-mint)] bg-white p-5 pl-[22px] dark:bg-slate-900"
                                >
                                    <div className="absolute top-0 right-0 left-0 h-0.5 bg-[var(--hr-mint)]" />
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                Step {card.step}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-[20px] bg-[var(--hr-mint-dim)] px-2 py-0.5 text-[10px] font-semibold text-[#2ea89e]">
                                                <CheckCircle2 className="h-3 w-3" />
                                                {t(
                                                    'dashboard.pathfinder.complete',
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(78,205,196,0.15)]">
                                            <CheckCircle2 className="h-5 w-5 text-[#2ea89e]" />
                                        </div>
                                    </div>
                                    <h4 className="mb-1.5 text-sm font-bold tracking-[-0.2px] text-slate-800 dark:text-slate-100">
                                        {card.title}
                                    </h4>
                                    <p className="mb-3 text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                                        {card.desc}
                                    </p>
                                    {card.id === 'diagnosis' &&
                                        card.stepStatus === 'submitted' && (
                                            <p className="mb-4 text-[11px] font-medium text-[#2ea89e]">
                                                {t(
                                                    'dashboard.pathfinder.submitted_wait_ceo',
                                                    'Diagnosis submitted — waiting for CEO review',
                                                )}
                                            </p>
                                        )}
                                    <Link
                                        href={getStepRoute(card.id, projectId)}
                                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--hr-navy)] hover:text-[var(--hr-navy-mid)]"
                                    >
                                        {t('buttons.view', 'View')} →
                                    </Link>
                                </div>
                            ) : card.status === 'current' ? (
                                <div
                                    key={card.step}
                                    className="relative overflow-hidden rounded-xl border border-[#4ecdc4] bg-white p-5 pl-[22px] shadow-[0_0_0_1px_#4ecdc4,0_4px_20px_rgba(78,205,196,0.12)] transition-all dark:bg-slate-900"
                                >
                                    <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-[#4ecdc4] to-[#3ab5ad]" />
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                Step {card.step}
                                            </span>
                                            <span className="rounded-[20px] bg-[var(--hr-mint-dim)] px-2 py-0.5 text-[10px] font-semibold text-[#2ea89e]">
                                                ●{' '}
                                                {t(
                                                    'dashboard.pathfinder.in_progress',
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(78,205,196,0.12)] text-base">
                                        <Building2 className="h-5 w-5 text-[#4ecdc4]" />
                                    </div>
                                    <h4 className="mb-1.5 text-sm font-bold tracking-[-0.2px] text-slate-800 dark:text-slate-100">
                                        {card.title}
                                    </h4>
                                    <p className="mb-4 text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                                        {card.desc}
                                    </p>
                                    <div className="mb-4">
                                        <div className="mb-1 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                                            <span>
                                                {t(
                                                    'dashboard.pathfinder.progress_label',
                                                )}
                                            </span>
                                            <span>{card.progress}%</span>
                                        </div>
                                        <div className="h-1 overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
                                            <div
                                                className="h-full rounded bg-gradient-to-r from-[#4ecdc4] to-[#3ab5ad] transition-[width] duration-500 ease-out"
                                                style={{
                                                    width: `${card.progress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span />
                                        <Link
                                            href={getStepRoute(
                                                card.id,
                                                projectId,
                                            )}
                                            className="flex items-center gap-1.5 rounded-[7px] bg-[var(--hr-navy)] px-4 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--hr-navy-mid)]"
                                        >
                                            {card.progress === 0
                                                ? t(
                                                      'dashboard.pathfinder.start_btn',
                                                  )
                                                : t(
                                                      'dashboard.pathfinder.continue',
                                                  )}{' '}
                                            →
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    key={card.step}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-5 opacity-70 dark:border-slate-700 dark:bg-slate-800"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                Step {card.step}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-[20px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                <Lock className="h-3 w-3" />
                                                {t(
                                                    'dashboard.pathfinder.locked',
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-slate-100 text-[13px] dark:bg-slate-800">
                                            <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                        </div>
                                    </div>
                                    <h4 className="mb-1.5 text-sm font-bold text-slate-400 dark:text-slate-500">
                                        {card.title}
                                    </h4>
                                    <p className="mb-4 text-[11.5px] leading-relaxed text-slate-400 dark:text-slate-500">
                                        {card.desc}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                        {t(
                                            'dashboard.pathfinder.prev_step_required_after',
                                        )}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
