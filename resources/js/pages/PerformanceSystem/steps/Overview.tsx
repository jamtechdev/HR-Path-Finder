import {
    FileText,
    CheckCircle2,
    ArrowRight,
    Target,
    Settings,
    LayoutGrid,
    Send,
    Lock,
    Rocket,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

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
    snapshotResponses?: Record<number, any>;
    organizationalKpis?: any[];
    evaluationModelAssignments?: any[];
    evaluationStructure?: any;
    jobCount?: number;
    snapshotQuestionsCount?: number;
    completedTabsCount?: number;
    tabsLength?: number;
    hideProgressCard?: boolean;
}

const STEPS: StepConfig[] = [
    {
        id: 'performance-snapshot',
        nameKey: 'performance_system_index.tabs.snapshot',
        descriptionKey: 'performance_system_index.overview.step_desc.snapshot',
        icon: <FileText className="w-5 h-5" />,
        route: 'performance-snapshot',
        estMin: 5,
    },
    {
        id: 'kpi-review',
        nameKey: 'performance_system_index.tabs.kpi',
        descriptionKey: 'performance_system_index.overview.step_desc.kpi',
        icon: <Target className="w-5 h-5" />,
        route: 'kpi-review',
        estMin: 4,
    },
    {
        id: 'model-assignment',
        nameKey: 'performance_system_index.tabs.model',
        descriptionKey: 'performance_system_index.overview.step_desc.model',
        icon: <Settings className="w-5 h-5" />,
        route: 'model-assignment',
        estMin: 5,
    },
    {
        id: 'evaluation-structure',
        nameKey: 'performance_system_index.tabs.structure',
        descriptionKey: 'performance_system_index.overview.step_desc.structure',
        icon: <LayoutGrid className="w-5 h-5" />,
        route: 'evaluation-structure',
        estMin: 3,
    },
    {
        id: 'review-submit',
        nameKey: 'performance_system_index.tabs.review',
        descriptionKey: 'performance_system_index.overview.step_desc.review',
        icon: <Send className="w-5 h-5" />,
        route: 'review-submit',
        estMin: 2,
    },
];

export default function PerformanceSystemOverview({
    projectId,
    stepStatuses = {},
    completedSteps = new Set(),
    onStepClick,
    snapshotResponses = {},
    organizationalKpis = [],
    evaluationModelAssignments = [],
    evaluationStructure,
    jobCount = 0,
    snapshotQuestionsCount = 10,
    completedTabsCount: completedCountProp,
    tabsLength: totalStepsProp,
    hideProgressCard = false,
}: Props) {
    const { t } = useTranslation();
    const completedCount = completedCountProp ?? STEPS.filter((s) => completedSteps.has(s.id)).length;
    const totalSteps = totalStepsProp ?? STEPS.length;
    const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

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
        } else {
            window.location.href = `/hr-manager/performance-system/${projectId}/${step.route}`;
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full">
            {!hideProgressCard && (
            <Card className="mx-auto mb-6 w-full max-w-[1000px] shrink-0 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-[#121431] dark:text-slate-100">
                        {t('performance_system_index.overview.progress_summary')}
                    </CardTitle>
                    <CardDescription className="text-[#6b7280] dark:text-slate-300">
                        {t('performance_system_index.overview.steps_completed', {
                            completed: completedCount,
                            total: totalSteps,
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="mb-2 text-xs font-medium text-[#6b7280] dark:text-slate-300">
                        {t('performance_system_index.overview.overall_progress')}
                    </p>
                    <div className="h-2 w-full rounded-full bg-[#e5e7eb] dark:bg-slate-700">
                        <div
                            className="bg-[#059669] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </CardContent>
            </Card>
            )}

            {/* Timeline — flex-1 so footer sits at bottom of viewport when used inside overview layout */}
            <div className="flex-1 min-h-0 relative w-full max-w-[1000px] mx-auto space-y-6 px-2 pb-4">
                <div className="absolute bottom-0 left-8 top-0 z-[1] w-px bg-[#d1d5db] dark:bg-slate-700" aria-hidden />
                <div className="space-y-6 relative z-[2]">
                    {STEPS.map((step, index) => {
                        const completed = completedSteps.has(step.id);
                        const enabled = isStepEnabled(index);
                        const isActive = enabled && !completed;

                        return (
                            <div key={step.id} className="flex gap-6">
                                <div
                                    className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-5 border',
                                        completed && 'bg-emerald-500 border-emerald-500 text-white',
                                        isActive && 'bg-[#1e293b] text-white border-[#1e293b]',
                                        !enabled && 'border-[#d1d5db] bg-white text-[#94a3b8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                                    )}
                                >
                                    {completed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                                </div>
                                <div
                                    className={cn(
                                        'flex flex-1 flex-col gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6 transition-all sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900',
                                        isActive && 'border-2 border-[#1e293b] shadow-lg',
                                        !enabled && 'bg-[#fafafa] opacity-60 dark:bg-slate-800'
                                    )}
                                >
                                    <div className="min-w-0">
                                        <div
                                            className={cn(
                                                'text-[11px] font-bold uppercase',
                                                enabled ? 'text-[#b38e5d]' : 'text-[#cbd5e1] dark:text-slate-500'
                                            )}
                                        >
                                            STEP {index + 1} OF {STEPS.length}
                                        </div>
                                        <div
                                            className={cn(
                                                'text-xl font-bold mt-1 flex items-center gap-2',
                                                enabled ? 'text-[#1e293b] dark:text-slate-100' : 'text-[#94a3b8] dark:text-slate-400'
                                            )}
                                        >
                                            {step.icon}
                                            {t(step.nameKey)}
                                        </div>
                                        <p
                                            className={cn(
                                                'text-sm mt-1 mb-3',
                                                enabled ? 'text-[#64748b] dark:text-slate-300' : 'text-[#cbd5e1] dark:text-slate-500'
                                            )}
                                        >
                                            {t(step.descriptionKey)}
                                        </p>
                                        <div
                                            className={cn('text-xs', enabled ? 'text-[#94a3b8] dark:text-slate-400' : 'text-[#cbd5e1] dark:text-slate-500')}
                                        >
                                            {t('performance_system_index.overview.estimated_time', {
                                                minutes: step.estMin,
                                            })}
                                            {!enabled && index > 0 &&
                                                ` • ${t('performance_system_index.overview.complete_step_first', {
                                                    step: index,
                                                })}`}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                        {enabled && !completed && (
                                            <>
                                                <div className="rounded-lg bg-[#f8fafc] px-3 py-1.5 text-xs text-[#64748b] dark:bg-slate-800 dark:text-slate-300">
                                                    {t('performance_system_index.overview.ready_to_start')}
                                                </div>
                                                <Button
                                                    onClick={() => handleStart(step, index)}
                                                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
                                                >
                                                    {t('performance_system_index.overview.start')} <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                        {completed && (
                                            <Button
                                                onClick={() => handleStart(step, index)}
                                                variant="outline"
                                                className="font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
                                            >
                                                {t('performance_system_index.overview.review')} <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {!enabled && (
                                            <div className="flex items-center gap-1.5 rounded-lg bg-[#f1f5f9] px-3 py-2 text-xs text-[#94a3b8] dark:bg-slate-800 dark:text-slate-400">
                                                <Lock className="w-3.5 h-3.5" />
                                                {t('performance_system_index.overview.locked')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer — match Job Analysis org-chart / policy step bar */}
            <footer
                className="sticky bottom-0 z-10 flex w-full shrink-0 flex-wrap items-center justify-between gap-4 border-t border-[#e0ddd5] bg-white px-6 py-[18px] dark:border-slate-700 dark:bg-slate-900 md:px-[60px]"
                style={{
                    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
                }}
            >
                <p className="text-[13px] font-medium text-[#94a3b8] dark:text-slate-400">
                    <strong className="text-[#121431] dark:text-slate-100">{completedCount}</strong> of{' '}
                    <strong className="text-[#121431] dark:text-slate-100">{totalSteps}</strong>{' '}
                    {t('performance_system_index.overview.steps_completed_suffix')}
                </p>
                <Button
                    onClick={() => handleStart(STEPS[0], 0)}
                    className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white font-bold px-9 py-6 rounded-lg"
                >
                    <Rocket className="w-4 h-4 mr-2" />
                    {t('performance_system_index.overview.start_performance_system')}
                </Button>
            </footer>
        </div>
    );
}
