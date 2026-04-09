import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    Check,
    CheckCircle2,
    Layers,
    Lock,
    Network,
    Rocket,
    Upload,
    UserCheck,
    UserCog,
    Users,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Diagnosis {
    id: number;
    status: string;
    industry_category?: string;
    industry_subcategory?: string;
    present_headcount?: number;
    expected_headcount_1y?: number;
    total_executives?: number;
    executive_positions?: unknown;
    leadership_count?: number;
    job_grade_names?: unknown[];
    organizational_charts?: unknown;
    org_structure_types?: unknown;
    organizational_structure?: unknown;
    job_categories?: unknown[];
    job_functions?: unknown[];
    hr_issues?: unknown;
    custom_hr_issues?: string;
}

interface Project {
    id: number;
    company: {
        name: string;
    };
    diagnosis?: Diagnosis;
}

interface StepConfig {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    estMin: number;
}

interface Props {
    project: Project;
    company: Project['company'];
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
}

// Helper function to validate completion
function validateStepCompletion(
    tabId: string,
    diagnosis: Diagnosis | undefined,
): boolean {
    if (!diagnosis) return false;
    switch (tabId) {
        case 'company-info':
            return !!(
                diagnosis.industry_category &&
                String(diagnosis.industry_category).trim() !== ''
            );
        case 'workforce':
            return !!(
                diagnosis.present_headcount && diagnosis.present_headcount > 0
            );
        case 'organizational-charts': {
            const charts = diagnosis.organizational_charts;
            if (Array.isArray(charts)) return charts.length > 0;
            if (charts && typeof charts === 'object')
                return Object.keys(charts).length > 0;
            return false;
        }
        case 'organizational-structure': {
            const structure =
                diagnosis.org_structure_types ??
                diagnosis.organizational_structure;
            if (Array.isArray(structure)) return structure.length > 0;
            if (structure && typeof structure === 'object')
                return Object.keys(structure).length > 0;
            return false;
        }
        case 'job-structure':
            return !!(
                (diagnosis.job_categories &&
                    diagnosis.job_categories.length > 0) ||
                (diagnosis.job_functions && diagnosis.job_functions.length > 0)
            );
        case 'hr-issues':
            return !!(
                (diagnosis.hr_issues &&
                    (Array.isArray(diagnosis.hr_issues)
                        ? diagnosis.hr_issues.length > 0
                        : false)) ||
                (diagnosis.custom_hr_issues &&
                    String(diagnosis.custom_hr_issues).trim() !== '')
            );
        case 'executives':
            return !!(
                diagnosis.total_executives != null ||
                (diagnosis.executive_positions &&
                    Array.isArray(diagnosis.executive_positions) &&
                    diagnosis.executive_positions.length > 0)
            );
        case 'leaders':
            return diagnosis.leadership_count != null;
        case 'job-grades':
            return !!(
                diagnosis.job_grade_names &&
                Array.isArray(diagnosis.job_grade_names) &&
                diagnosis.job_grade_names.length > 0
            );
        default:
            return false;
    }
}

export default function DiagnosisOverview({
    project,
    company,
    diagnosis,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    const { t } = useTranslation();
    const pid = projectId ?? project?.id;
    const isReviewSubmitted = ['submitted', 'approved', 'locked'].includes(
        diagnosisStatus,
    );

    // Steps configuration using the 'diagnosis_overview' namespace
    const STEPS: StepConfig[] = [
        {
            id: 'company-info',
            name: t('diagnosis_overview.steps.company_info.name'),
            description: t('diagnosis_overview.steps.company_info.desc'),
            icon: <Building2 className="h-5 w-5" />,
            route: 'company-info',
            estMin: 4,
        },
        {
            id: 'workforce',
            name: t('diagnosis_overview.steps.workforce.name'),
            description: t('diagnosis_overview.steps.workforce.desc'),
            icon: <Users className="h-5 w-5" />,
            route: 'workforce',
            estMin: 4,
        },
        {
            id: 'executives',
            name: t('diagnosis_overview.steps.executives.name'),
            description: t('diagnosis_overview.steps.executives.desc'),
            icon: <UserCog className="h-5 w-5" />,
            route: 'executives',
            estMin: 2,
        },
        {
            id: 'leaders',
            name: t('diagnosis_overview.steps.leaders.name'),
            description: t('diagnosis_overview.steps.leaders.desc'),
            icon: <UserCheck className="h-5 w-5" />,
            route: 'leaders',
            estMin: 2,
        },
        {
            id: 'job-grades',
            name: t('diagnosis_overview.steps.job_grades.name'),
            description: t('diagnosis_overview.steps.job_grades.desc'),
            icon: <BriefcaseBusiness className="h-5 w-5" />,
            route: 'job-grades',
            estMin: 3,
        },
        {
            id: 'organizational-charts',
            name: t('diagnosis_overview.steps.org_charts.name'),
            description: t('diagnosis_overview.steps.org_charts.desc'),
            icon: <Upload className="h-5 w-5" />,
            route: 'organizational-charts',
            estMin: 5,
        },
        {
            id: 'organizational-structure',
            name: t('diagnosis_overview.steps.org_structure.name'),
            description: t('diagnosis_overview.steps.org_structure.desc'),
            icon: <Network className="h-5 w-5" />,
            route: 'organizational-structure',
            estMin: 2,
        },
        {
            id: 'job-structure',
            name: t('diagnosis_overview.steps.job_structure.name'),
            description: t('diagnosis_overview.steps.job_structure.desc'),
            icon: <Layers className="h-5 w-5" />,
            route: 'job-structure',
            estMin: 4,
        },
        {
            id: 'hr-issues',
            name: t('diagnosis_overview.steps.hr_issues.name'),
            description: t('diagnosis_overview.steps.hr_issues.desc'),
            icon: <AlertTriangle className="h-5 w-5" />,
            route: 'hr-issues',
            estMin: 3,
        },
        {
            id: 'review',
            name: t('diagnosis_overview.steps.review.name'),
            description: t('diagnosis_overview.steps.review.desc'),
            icon: <Check className="h-5 w-5" />,
            route: 'review',
            estMin: 2,
        },
    ];

    const TOTAL_EST_MIN = 31;

    const completedSteps = React.useMemo(() => {
        const set = new Set<string>();
        STEPS.forEach((step) => {
            if (step.id === 'review') {
                if (isReviewSubmitted) set.add(step.id);
                return;
            }
            const status = stepStatuses[step.id];
            const statusDone =
                status &&
                ['submitted', 'approved', 'locked', 'completed', true].includes(
                    status as string,
                );
            if (statusDone || validateStepCompletion(step.id, diagnosis)) {
                set.add(step.id);
            }
        });
        return set;
    }, [diagnosis, stepStatuses, isReviewSubmitted]);

    const completedCount = STEPS.filter((s) => completedSteps.has(s.id)).length;
    const progressPct = STEPS.length
        ? Math.round((completedCount / STEPS.length) * 100)
        : 0;

    const statusLabel = isReviewSubmitted
        ? t('diagnosis_overview.status.submitted')
        : diagnosisStatus === 'in_progress' || completedCount > 0
          ? t('diagnosis_overview.status.in_progress')
          : t('diagnosis_overview.status.not_started');

    const isStepEnabled = (index: number) => {
        if (index === 0) return true;
        for (let i = 0; i < index; i++) {
            if (!completedSteps.has(STEPS[i].id)) return false;
        }
        return true;
    };

    const handleStart = (step: StepConfig, index: number) => {
        if (!isStepEnabled(index)) return;
        const url = pid
            ? `/hr-manager/diagnosis/${pid}/${step.route}`
            : `/hr-manager/diagnosis/${step.route}`;
        router.visit(url);
    };

    return (
        <AppLayout
            showWorkflowSteps={true}
            stepStatuses={stepStatuses}
            projectId={pid}
        >
            <Head
                title={`${t('diagnosis_overview.hero.stage_title')} - ${company?.name || project?.company?.name || 'Company'}`}
            />

            <div className="flex min-h-full flex-col bg-[#f5f3ef] text-[#1e293b] dark:bg-background dark:text-foreground">
                {/* Hero Section */}
                <section className="bg-[#0f172a] px-6 py-10 pb-20 text-white md:px-[10%]">
                    <div className="mb-4">
                        <Link
                            href="/hr-manager/dashboard"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#b38e5d] bg-[#b38e5d]/10 px-3 py-1.5 text-sm font-semibold text-[#b38e5d] transition-colors hover:bg-[#b38e5d]/20"
                        >
                            ← {t('diagnosis_overview.common.back')}
                        </Link>
                    </div>

                    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-lg font-bold">
                            HR Path-Finder{' '}
                            <span className="ml-2 font-normal text-[#64748b]">
                                / {t('diagnosis_overview.hero.breadcrumb')}
                            </span>
                        </div>
                        <div className="rounded-[20px] border border-white/20 bg-white/10 px-3 py-1 text-xs text-[#94a3b8]">
                            {statusLabel}
                        </div>
                    </div>

                    <div className="mb-1 text-xs font-bold tracking-wider text-[#b38e5d] uppercase">
                        ● {t('diagnosis_overview.hero.stage_indicator')}
                    </div>
                    <h1 className="mt-2 mb-2 text-3xl font-bold md:text-4xl">
                        {t('diagnosis_overview.hero.title')}
                    </h1>
                    <p className="max-w-[600px] leading-relaxed text-[#94a3b8]">
                        {t('diagnosis_overview.hero.subtitle')}
                    </p>

                    <div className="mt-6 max-w-[720px] rounded-xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-2 text-[11px] font-bold tracking-wider text-[#b38e5d] uppercase">
                            {t('diagnosis_overview.hero.notice_title')}
                        </div>
                        <p className="m-0 text-sm leading-relaxed text-[#e2e8f0]">
                            {t('diagnosis_overview.hero.notice_desc')}
                        </p>
                    </div>

                    {/* Progress Stats */}
                    <div className="mt-8 flex flex-col gap-6 rounded-xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:gap-10">
                        <div className="border-r-0 pr-0 md:border-r md:border-white/10 md:pr-10">
                            <div className="text-[11px] text-[#94a3b8] uppercase">
                                {t('diagnosis_overview.progress.steps_done')}
                            </div>
                            <strong className="text-2xl text-[#b38e5d]">
                                {completedCount} / {STEPS.length}
                            </strong>
                            <div className="text-[11px] text-[#64748b]">
                                {t(
                                    'diagnosis_overview.progress.completed_label',
                                )}
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="mb-2 flex justify-between text-xs font-bold">
                                <span>
                                    {t('diagnosis_overview.progress.overall')}
                                </span>
                                <span>{progressPct}%</span>
                            </div>
                            <div className="h-1 w-full overflow-hidden rounded-sm bg-white/10">
                                <div
                                    className="h-full rounded-sm bg-[#b38e5d] transition-all duration-300"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>
                        <div className="rounded-[20px] border border-[#b38e5d] px-4 py-2 text-[13px] whitespace-nowrap text-white">
                            ⏱{' '}
                            {t('diagnosis_overview.progress.est_time', {
                                time: TOTAL_EST_MIN,
                            })}
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <div className="relative mx-auto -mt-10 w-full max-w-[1000px] flex-1 px-5">
                    <div
                        className="absolute top-0 bottom-0 left-8 z-[1] w-px bg-[#d1d5db] dark:bg-[#2a3a5c]"
                        aria-hidden
                    />

                    <div className="relative z-[2] space-y-6">
                        {STEPS.map((step, index) => {
                            const completed = completedSteps.has(step.id);
                            const enabled = isStepEnabled(index);
                            const isActive = enabled && !completed;

                            return (
                                <div key={step.id} className="flex gap-6">
                                    <div
                                        className={cn(
                                            'mt-5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                                            completed &&
                                                'border-emerald-500 bg-emerald-500 text-white',
                                            isActive &&
                                                'border-[#1e293b] bg-[#1e293b] text-white dark:border-[#2EC4A9] dark:bg-[#2EC4A9]',
                                            !enabled &&
                                                'border-[#d1d5db] bg-white text-[#94a3b8] dark:border-[#2a3a5c] dark:bg-[#1a2744]',
                                        )}
                                    >
                                        {completed ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>

                                    <div
                                        className={cn(
                                            'flex flex-1 flex-col gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6 transition-all sm:flex-row sm:items-center sm:justify-between dark:border-[#2a3a5c] dark:bg-[#1a2744]',
                                            isActive &&
                                                'border-2 border-[#1e293b] shadow-lg dark:border-[#2EC4A9]',
                                            !enabled &&
                                                'bg-[#fafafa] opacity-60 dark:bg-[#131f35]',
                                        )}
                                    >
                                        <div className="min-w-0">
                                            <div
                                                className={cn(
                                                    'text-[11px] font-bold uppercase',
                                                    enabled
                                                        ? 'text-[#b38e5d]'
                                                        : 'text-[#cbd5e1] dark:text-[#4a5a7c]',
                                                )}
                                            >
                                                {t(
                                                    'diagnosis_overview.step_label',
                                                    {
                                                        current: index + 1,
                                                        total: STEPS.length,
                                                    },
                                                )}
                                            </div>
                                            <div
                                                className={cn(
                                                    'mt-1 flex items-center gap-2 text-xl font-bold',
                                                    enabled
                                                        ? 'text-[#1e293b] dark:text-[#e2e8f0]'
                                                        : 'text-[#94a3b8] dark:text-[#4a5a7c]',
                                                )}
                                            >
                                                {step.icon}
                                                {step.name}
                                            </div>
                                            <p
                                                className={cn(
                                                    'mt-1 mb-3 text-sm',
                                                    enabled
                                                        ? 'text-[#64748b] dark:text-[#9AA3B2]'
                                                        : 'text-[#cbd5e1] dark:text-[#4a5a7c]',
                                                )}
                                            >
                                                {step.description}
                                            </p>
                                            <div
                                                className={cn(
                                                    'text-xs',
                                                    enabled
                                                        ? 'text-[#94a3b8]'
                                                        : 'text-[#cbd5e1] dark:text-[#4a5a7c]',
                                                )}
                                            >
                                                ~{step.estMin} min
                                                {!enabled &&
                                                    index > 0 &&
                                                    ` • ${t('diagnosis_overview.common.lock_msg', { step: index })}`}
                                            </div>
                                        </div>

                                        <div className="flex flex-shrink-0 flex-col items-end gap-3">
                                            {enabled && !completed && (
                                                <>
                                                    <div className="rounded-lg bg-[#f8fafc] px-3 py-1.5 text-xs text-[#64748b] dark:bg-[#1e3a5f]/30 dark:text-[#9AA3B2]">
                                                        {t(
                                                            'diagnosis_overview.common.ready',
                                                        )}
                                                    </div>
                                                    <Button
                                                        onClick={() =>
                                                            handleStart(
                                                                step,
                                                                index,
                                                            )
                                                        }
                                                        className="flex items-center gap-2 rounded-lg bg-[#0f172a] px-6 py-2.5 font-bold text-white hover:bg-[#1e293b]"
                                                    >
                                                        {t(
                                                            'diagnosis_overview.common.start',
                                                        )}{' '}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {completed && (
                                                <Button
                                                    onClick={() =>
                                                        handleStart(step, index)
                                                    }
                                                    variant="outline"
                                                    className="flex items-center gap-2 rounded-lg px-6 py-2.5 font-bold"
                                                >
                                                    {t(
                                                        'diagnosis_overview.common.review',
                                                    )}{' '}
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {!enabled && (
                                                <div className="flex items-center gap-1.5 rounded-lg bg-[#f1f5f9] px-3 py-2 text-xs text-[#94a3b8] dark:bg-[#1e3a5f]/20 dark:text-[#6B7585]">
                                                    <Lock className="h-3.5 w-3.5" />
                                                    {t(
                                                        'diagnosis_overview.common.locked',
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <footer className="sticky bottom-0 z-10 mt-auto flex w-full flex-wrap items-center justify-between gap-4 border-t border-[#e2e8f0] bg-white px-5 py-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] md:px-[10%] dark:border-[#2a3a5c] dark:bg-[#1a2744]">
                    <p className="text-sm text-[#64748b] dark:text-[#9AA3B2]">
                        <b>{completedCount}</b>{' '}
                        {t('diagnosis_overview.footer.count_text', {
                            total: STEPS.length,
                        })}
                    </p>
                    <Button
                        onClick={() => handleStart(STEPS[0], 0)}
                        className="rounded-lg bg-[#0f172a] px-8 py-3 font-bold text-white hover:bg-[#1e293b]"
                    >
                        <Rocket className="mr-2 h-4 w-4" />
                        {t('diagnosis_overview.footer.start_btn')}
                    </Button>
                </footer>
            </div>
        </AppLayout>
    );
}
