import {
    CheckCircle2,
    ArrowRight,
    FileText,
    Settings,
    TrendingUp,
    Award,
    Users,
    Rocket,
    Lock,
    DollarSign,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StepConfig {
    id: string;
    nameKey: string;
    descriptionKey: string;
    icon: React.ReactNode;
    route: string;
    estMin: number;
}

interface Props {
    projectId: number;
    stepStatuses?: Record<string, string>;
    completedSteps?: Set<string>;
    onStepClick?: (stepId: string) => void;
}

const STEPS: StepConfig[] = [
    {
        id: 'snapshot',
        nameKey: 'compensation_system.tabs.snapshot',
        descriptionKey: 'compensation_system.step_desc.snapshot',
        icon: <FileText className="w-5 h-5" />,
        route: 'snapshot',
        estMin: 5,
    },
    {
        id: 'base-salary-framework',
        nameKey: 'compensation_system.tabs.base_salary_framework',
        descriptionKey: 'compensation_system.step_desc.base_salary_framework',
        icon: <Settings className="w-5 h-5" />,
        route: 'base-salary-framework',
        estMin: 4,
    },
    {
        id: 'pay-band-salary-table',
        nameKey: 'compensation_system.tabs.pay_band_salary_table',
        descriptionKey: 'compensation_system.step_desc.pay_band_salary_table',
        icon: <TrendingUp className="w-5 h-5" />,
        route: 'pay-band-salary-table',
        estMin: 5,
    },
    {
        id: 'bonus-pool',
        nameKey: 'compensation_system.tabs.bonus_pool',
        descriptionKey: 'compensation_system.step_desc.bonus_pool',
        icon: <Award className="w-5 h-5" />,
        route: 'bonus-pool',
        estMin: 4,
    },
    {
        id: 'benefits',
        nameKey: 'compensation_system.tabs.benefits',
        descriptionKey: 'compensation_system.step_desc.benefits',
        icon: <Users className="w-5 h-5" />,
        route: 'benefits',
        estMin: 4,
    },
    {
        id: 'review',
        nameKey: 'compensation_system.tabs.review',
        descriptionKey: 'compensation_system.step_desc.review',
        icon: <Rocket className="w-5 h-5" />,
        route: 'review',
        estMin: 2,
    },
];

const TOTAL_EST_MIN = 24;

export default function CompensationOverview({
    projectId: _projectId,
    stepStatuses = {},
    completedSteps = new Set(),
    onStepClick,
}: Props) {
    const { t } = useTranslation();
    const compensationStatus = stepStatuses?.compensation || 'not_started';
    const isInProgress = compensationStatus === 'in_progress';
    const isSubmitted = ['submitted', 'approved', 'locked'].includes(compensationStatus);

    const completedCount = STEPS.filter((s) => completedSteps.has(s.id)).length;
    const progressPct = STEPS.length ? Math.round((completedCount / STEPS.length) * 100) : 0;

    const isStepEnabled = (index: number) => {
        if (index === 0) return true;
        for (let i = 0; i < index; i++) {
            if (!completedSteps.has(STEPS[i].id)) return false;
        }
        return true;
    };

    const handleStart = (step: StepConfig, index: number) => {
        if (!isStepEnabled(index)) return;
        if (onStepClick) {
            onStepClick(step.id);
        }
    };

    const statusLabel =
        isSubmitted
            ? t('performance_system_index.status.submitted')
            : isInProgress
              ? t('performance_system_index.status.in_progress')
              : completedCount === STEPS.length
                ? t('compensation_system.ready_for_review')
                : t('performance_system_index.status.not_started');

    return (
        <div className="min-h-full flex flex-col bg-background text-foreground">
            <section className="flex-shrink-0 bg-[var(--hr-navy)] text-white px-6 py-10 pb-20 md:px-[10%]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <div className="font-bold text-lg">
                        HR Path-Finder{' '}
                        <span className="font-normal text-white/50 ml-2">/ {t('compensation_system.title')}</span>
                    </div>
                    <div className="bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs text-white/70">
                        {statusLabel}
                    </div>
                </div>

                <div className="text-[var(--hr-gold)] uppercase text-xs font-bold tracking-wider mb-1">
                    {t('compensation_system.stage_4_5')}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-2">{t('compensation_system.overview_title')}</h1>
                <p className="text-white/60 max-w-[600px] leading-relaxed">{t('compensation_system.overview_desc')}</p>

                <div className="mt-6 p-5 rounded-xl bg-white/5 border border-white/10 max-w-[720px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--hr-gold)] mb-2">
                        {t('compensation_system.before_begin')}
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed m-0">{t('compensation_system.before_begin_desc')}</p>
                </div>

                <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                    <div className="border-r-0 md:border-r md:border-white/10 pr-0 md:pr-10">
                        <div className="text-[11px] text-white/50 uppercase">{t('compensation_system.steps_done')}</div>
                        <strong className="text-2xl text-[var(--hr-gold)]">
                            {completedCount} / {STEPS.length}
                        </strong>
                        <div className="text-[11px] text-white/40">{t('compensation_system.steps_completed')}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs font-bold mb-2 text-white/80">
                            <span>{t('compensation_system.overall_progress')}</span>
                            <span>{progressPct}%</span>
                        </div>
                        <div className="h-1 w-full rounded-sm bg-white/10 overflow-hidden">
                            <div
                                className="h-full rounded-sm bg-[var(--hr-mint)] transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                    <div className="border border-[var(--hr-gold)]/60 px-4 py-2 rounded-full text-white text-[13px] whitespace-nowrap bg-black/20">
                        ⏱ {t('compensation_system.estimated_total', { minutes: TOTAL_EST_MIN })}
                    </div>
                </div>
            </section>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin -mt-10">
                <div className="max-w-[90rem] mx-auto px-6 pb-8 relative w-full">
                    <div
                        className="absolute left-10 top-0 bottom-0 w-px bg-border z-[1] hidden sm:block"
                        aria-hidden
                    />

                    <div className="space-y-8 relative z-[2]">
                        {STEPS.map((step, index) => {
                            const completed = completedSteps.has(step.id);
                            const enabled = isStepEnabled(index);
                            const isActive = enabled && !completed;

                            return (
                                <div key={step.id} className="flex gap-8">
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-6 border',
                                            completed && 'bg-emerald-500 border-emerald-500 text-white',
                                            isActive && 'bg-[var(--hr-mint)] border-[var(--hr-mint)] text-[var(--hr-navy)]',
                                            !enabled &&
                                                'bg-muted border-border text-muted-foreground'
                                        )}
                                    >
                                        {completed ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                                    </div>

                                    <div
                                        className={cn(
                                            'flex-1 rounded-2xl border p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 transition-all min-w-0',
                                            'bg-card text-card-foreground border-border shadow-sm',
                                            isActive && 'ring-2 ring-[var(--hr-mint)]/50 border-[var(--hr-mint)]/40 shadow-md',
                                            !enabled && 'opacity-75 bg-muted/30'
                                        )}
                                    >
                                        <div className="min-w-0">
                                            <div
                                                className={cn(
                                                    'text-[11px] font-bold uppercase tracking-wider',
                                                    enabled ? 'text-[var(--hr-gold)]' : 'text-muted-foreground'
                                                )}
                                            >
                                                {t('compensation_system.step_of', {
                                                    current: index + 1,
                                                    total: STEPS.length,
                                                })}
                                            </div>
                                            <div
                                                className={cn(
                                                    'text-2xl font-bold mt-2 flex items-center gap-3',
                                                    enabled ? 'text-foreground' : 'text-muted-foreground'
                                                )}
                                            >
                                                {step.icon}
                                                {t(step.nameKey)}
                                            </div>
                                            <p
                                                className={cn(
                                                    'text-base mt-2 mb-4',
                                                    enabled ? 'text-muted-foreground' : 'text-muted-foreground/80'
                                                )}
                                            >
                                                {t(step.descriptionKey)}
                                            </p>
                                            <div
                                                className={cn(
                                                    'text-sm',
                                                    enabled ? 'text-muted-foreground' : 'text-muted-foreground/70'
                                                )}
                                            >
                                                {t('compensation_system.estimated_min', { minutes: step.estMin })}
                                                {!enabled &&
                                                    index > 0 &&
                                                    ` • ${t('compensation_system.complete_step_first', { step: index })}`}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                            {enabled && !completed && (
                                                <>
                                                    <div className="bg-muted text-muted-foreground px-3 py-1.5 rounded-lg text-xs">
                                                        {t('compensation_system.ready_to_start')}
                                                    </div>
                                                    <Button
                                                        onClick={() => handleStart(step, index)}
                                                        className="bg-[var(--hr-mint)] hover:bg-[var(--hr-mint)]/90 text-[var(--hr-navy)] font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
                                                    >
                                                        {t('compensation_system.start')} <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {completed && (
                                                <Button
                                                    onClick={() => handleStart(step, index)}
                                                    variant="outline"
                                                    className="font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 border-[var(--hr-mint)]/40"
                                                >
                                                    {t('compensation_system.review')} <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {!enabled && (
                                                <div className="bg-muted text-muted-foreground px-3 py-2 rounded-lg text-xs flex items-center gap-1.5">
                                                    <Lock className="w-3.5 h-3.5" />
                                                    {t('compensation_system.locked')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <footer className="flex-shrink-0 sticky bottom-0 w-full bg-card py-4 px-5 md:px-[10%] flex flex-wrap items-center justify-between gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.12)] z-10 mt-auto border-t border-border">
                <p className="text-sm text-muted-foreground">
                    {t('compensation_system.footer_steps_line', {
                        completed: completedCount,
                        total: STEPS.length,
                    })}
                </p>
                <Button
                    onClick={() => onStepClick?.('snapshot')}
                    className="bg-[var(--hr-navy)] hover:bg-[var(--hr-navy-mid)] text-white font-bold px-8 py-3 rounded-lg"
                >
                    <DollarSign className="w-4 h-4 mr-2" />
                    {t('compensation_system.start_design')}
                </Button>
            </footer>
        </div>
    );
}
