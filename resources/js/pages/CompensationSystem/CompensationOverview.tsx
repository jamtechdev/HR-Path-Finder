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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StepConfig {
    id: string;
    name: string;
    description: string;
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
        name: 'Strategic Compensation Snapshot',
        description: 'Answer questions about your company\'s compensation philosophy and current approach.',
        icon: <FileText className="w-5 h-5" />,
        route: 'snapshot',
        estMin: 5,
    },
    {
        id: 'base-salary-framework',
        name: 'Base Salary Framework',
        description: 'Define salary structure type, adjustment unit, cycle, and performance linkage.',
        icon: <Settings className="w-5 h-5" />,
        route: 'base-salary-framework',
        estMin: 4,
    },
    {
        id: 'pay-band-salary-table',
        name: 'Pay Band / Salary Table',
        description: 'Configure pay bands or salary tables by job grade and level.',
        icon: <TrendingUp className="w-5 h-5" />,
        route: 'pay-band-salary-table',
        estMin: 5,
    },
    {
        id: 'bonus-pool',
        name: 'Bonus Pool Configuration',
        description: 'Set bonus pool determination, eligibility, and allocation rules.',
        icon: <Award className="w-5 h-5" />,
        route: 'bonus-pool',
        estMin: 4,
    },
    {
        id: 'benefits',
        name: 'Benefits Configuration',
        description: 'Define benefits programs, strategic direction, and expense ratios.',
        icon: <Users className="w-5 h-5" />,
        route: 'benefits',
        estMin: 4,
    },
    {
        id: 'review',
        name: 'Review & Submit',
        description: 'Final review and submission of your compensation system.',
        icon: <Rocket className="w-5 h-5" />,
        route: 'review',
        estMin: 2,
    },
];

const TOTAL_EST_MIN = 24;

export default function CompensationOverview({
    projectId,
    stepStatuses = {},
    completedSteps = new Set(),
    onStepClick,
}: Props) {
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
            ? 'SUBMITTED'
            : isInProgress
              ? 'IN PROGRESS'
              : completedCount === STEPS.length
                ? 'READY FOR REVIEW'
                : 'NOT STARTED';

    return (
        <div className="min-h-full flex flex-col bg-[#f5f3ef] text-[#1e293b]">
            {/* Hero Section - same dark theme as Job Analysis */}
            <section className="flex-shrink-0 bg-[#0f172a] text-white px-6 py-10 pb-20 md:px-[10%]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <div className="font-bold text-lg">
                        HR Path-Finder <span className="font-normal text-[#64748b] ml-2">/ Compensation System</span>
                    </div>
                    <div className="bg-white/10 border border-white/20 px-3 py-1 rounded-[20px] text-xs text-[#94a3b8]">
                        {statusLabel}
                    </div>
                </div>

                <div className="text-[#b38e5d] uppercase text-xs font-bold tracking-wider mb-1">
                    ● STAGE 4 OF 5 — COMPENSATION SYSTEM
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-2">Compensation System Overview</h1>
                <p className="text-[#94a3b8] max-w-[600px] leading-relaxed">
                    Define compensation structure, differentiation methods, and incentive components. Complete each step in
                    sequence to build a consultant-ready compensation and benefits framework.
                </p>

                {/* Before you begin */}
                <div className="mt-6 p-5 rounded-xl bg-white/5 border border-white/10 max-w-[720px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#b38e5d] mb-2">
                        Before you begin
                    </div>
                    <p className="text-[#e2e8f0] text-sm leading-relaxed m-0">
                        This stage builds on your job analysis and performance system. Your compensation snapshot answers
                        will be used to tailor the base salary framework and subsequent steps. There are no right or wrong
                        answers—your responses are baseline inputs for the compensation design. All inputs are confidential.
                    </p>
                </div>

                {/* Progress Card */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                    <div className="border-r-0 md:border-r md:border-white/10 pr-0 md:pr-10">
                        <div className="text-[11px] text-[#94a3b8] uppercase">Steps Done</div>
                        <strong className="text-2xl text-[#b38e5d]">
                            {completedCount} / {STEPS.length}
                        </strong>
                        <div className="text-[11px] text-[#64748b]">steps completed</div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span>Overall Progress</span>
                            <span>{progressPct}%</span>
                        </div>
                        <div className="h-1 w-full rounded-sm bg-white/10 overflow-hidden">
                            <div
                                className="h-full rounded-sm bg-[#b38e5d] transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                    <div className="border border-[#b38e5d] px-4 py-2 rounded-[20px] text-white text-[13px] whitespace-nowrap">
                        ⏱ Est. <b>~{TOTAL_EST_MIN} min</b> total
                    </div>
                </div>
            </section>

            {/* Scrollable step list with thin scrollbar */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin -mt-10">
            {/* Timeline Section - vertical step-by-step, full-width cards */}
            <div className="max-w-5xl mx-auto px-6 pb-8 relative w-full">
                <div className="absolute left-10 top-0 bottom-0 w-px bg-[#d1d5db] z-[1]" aria-hidden />

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
                                        isActive && 'bg-[#1e293b] text-white border-[#1e293b]',
                                        !enabled && 'bg-white border-[#d1d5db] text-[#94a3b8]'
                                    )}
                                >
                                    {completed ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                                </div>

                                <div
                                    className={cn(
                                        'flex-1 bg-white rounded-2xl border border-[#e2e8f0] p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 transition-all min-w-0',
                                        isActive && 'border-2 border-[#1e293b] shadow-lg',
                                        !enabled && 'opacity-60 bg-[#fafafa]'
                                    )}
                                >
                                    <div className="min-w-0">
                                        <div
                                            className={cn(
                                                'text-[11px] font-bold uppercase tracking-wider',
                                                enabled ? 'text-[#b38e5d]' : 'text-[#cbd5e1]'
                                            )}
                                        >
                                            STEP {index + 1} OF {STEPS.length}
                                        </div>
                                        <div
                                            className={cn(
                                                'text-2xl font-bold mt-2 flex items-center gap-3',
                                                enabled ? 'text-[#1e293b]' : 'text-[#94a3b8]'
                                            )}
                                        >
                                            {step.icon}
                                            {step.name}
                                        </div>
                                        <p
                                            className={cn(
                                                'text-base mt-2 mb-4',
                                                enabled ? 'text-[#64748b]' : 'text-[#cbd5e1]'
                                            )}
                                        >
                                            {step.description}
                                        </p>
                                        <div
                                            className={cn('text-sm', enabled ? 'text-[#94a3b8]' : 'text-[#cbd5e1]')}
                                        >
                                            ~{step.estMin} min
                                            {!enabled && index > 0 && ` • Complete Step ${index} first`}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                        {enabled && !completed && (
                                            <>
                                                <div className="bg-[#f8fafc] text-[#64748b] px-3 py-1.5 rounded-lg text-xs">
                                                    Ready to Start
                                                </div>
                                                <Button
                                                    onClick={() => handleStart(step, index)}
                                                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
                                                >
                                                    Start <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                        {completed && (
                                            <Button
                                                onClick={() => handleStart(step, index)}
                                                variant="outline"
                                                className="font-bold px-6 py-2.5 rounded-lg flex items-center gap-2"
                                            >
                                                Review <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {!enabled && (
                                            <div className="bg-[#f1f5f9] text-[#94a3b8] px-3 py-2 rounded-lg text-xs flex items-center gap-1.5">
                                                <Lock className="w-3.5 h-3.5" />
                                                Locked
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

            {/* Footer */}
            <footer className="flex-shrink-0 sticky bottom-0 w-full bg-white py-4 px-5 md:px-[10%] flex flex-wrap items-center justify-between gap-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10 mt-auto border-t border-[#e2e8f0]">
                <p className="text-sm text-[#64748b]">
                    <b>{completedCount}</b> of {STEPS.length} steps completed
                </p>
                <Button
                    onClick={() => onStepClick?.('snapshot')}
                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold px-8 py-3 rounded-lg"
                >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Start Design
                </Button>
            </footer>
        </div>
    );
}
